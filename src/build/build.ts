import type { Catalog, Mutagen, Skill } from '../catalog/catalog';
import { BASE_MAX_TOXICITY, MANTICORE_ARMOR, SAFE_TOXICITY_SHARE } from '../data/alchemy';
import type { ColourTree, MutagenId, MutationId } from '../data/mutations';
import type { KeySkill, TreeName } from '../data/skills';
import type { BuildSnapshot } from './build-snapshot';
import { GearLoadout } from './gear-loadout';
import { ToxicityPlan } from './toxicity-plan';

export const MAX_RANK = 3;
export const BASE_SLOTS = 12;
export const SLOTS_PER_GROUP = 3;
export const MUTAGEN_GROUPS = BASE_SLOTS / SLOTS_PER_GROUP;
// While it sits in a slot, Synergy raises every mutagen bonus by 10% per rank.
export const SYNERGY = { skill: 'synergy', bonusPerRank: 0.1 } as const;
// From a slot, Acquired Tolerance raises maximum Toxicity by 1 per learned recipe and rank, Metabolic
// Control by 10 per rank.
export const ACQUIRED_TOLERANCE = { skill: 'acquiredTolerance', perRecipe: 1 } as const;
export const METABOLIC_CONTROL = { skill: 'metabolicControl', perRank: 10 } as const;
// From a slot, these start to work at a share of maximum Toxicity, by rank.
const TOXICITY_THRESHOLD_SKILLS = [
  { skill: 'delayedRecovery', shares: [0.7, 0.65, 0.6] },
  { skill: 'highTolerance', shares: [0.8, 0.8, 0.8] },
] as const;

export const slotGroup = (slotIndex: number): number => Math.floor(slotIndex / SLOTS_PER_GROUP);

const isMutagenGroup = (group: number): boolean =>
  Number.isInteger(group) && group >= 0 && group < MUTAGEN_GROUPS;

// The Toxicity at which a slotted skill starts to work.
export type ToxicityThreshold = { readonly skill: Skill; readonly toxicity: number };

export type MutagenBonus = {
  readonly mutagen: Mutagen;
  readonly matching: number;
  readonly synergy: number;
  readonly value: number;
};

// One character build: skill ranks, slotted skills, mutagens and mutations, with the toxicity plan and the
// gear it owns.
// Every command leaves the build valid, so callers never have to repair it.
export class Build {
  readonly #catalog: Catalog;
  #ranks = new Map<Skill, number>();
  #slots: (Skill | null)[];
  #mutagens: (MutagenId | null)[] = Array<MutagenId | null>(MUTAGEN_GROUPS).fill(null);
  #researched = new Set<MutationId>();
  #mutation: MutationId | null = null;
  #toxicityPlan = new ToxicityPlan();
  #gear: GearLoadout;

  constructor(catalog: Catalog) {
    this.#catalog = catalog;
    this.#slots = Array<Skill | null>(BASE_SLOTS + catalog.extraSlotUnlocks.length).fill(null);
    this.#gear = new GearLoadout(catalog);
  }

  // Reads a saved or decoded build, skipping anything unknown or against the rules.
  static fromSnapshot(catalog: Catalog, snapshot: BuildSnapshot): Build {
    const build = new Build(catalog);
    for (const [tree, ranks] of Object.entries(snapshot.points)) {
      for (const [name, rank] of Object.entries(ranks)) {
        const skill = catalog.findSkill(tree, name);
        const value = Math.min(MAX_RANK, Math.max(0, Math.trunc(rank)));
        if (skill !== undefined && value > 0) build.#ranks.set(skill, value);
      }
    }
    for (const id of snapshot.researched) {
      const mutation = catalog.findMutation(id);
      if (mutation !== undefined && !mutation.innate) build.#researched.add(mutation.id);
    }
    build.#mutation =
      snapshot.mutation === null ? null : (catalog.findMutation(snapshot.mutation)?.id ?? null);
    snapshot.mutagens.slice(0, MUTAGEN_GROUPS).forEach((id, group) => {
      build.#mutagens[group] = id === null ? null : (catalog.findMutagen(id)?.id ?? null);
    });
    snapshot.slots.slice(0, build.slotCount).forEach((entry, index) => {
      const skill = entry === null ? undefined : catalog.findSkill(entry.tree, entry.name);
      if (skill !== undefined && build.slotOf(skill) < 0) build.#slots[index] = skill;
    });
    build.#normalize();
    return build;
  }

  clone(): Build {
    const copy = new Build(this.#catalog);
    copy.#ranks = new Map(this.#ranks);
    copy.#slots = [...this.#slots];
    copy.#mutagens = [...this.#mutagens];
    copy.#researched = new Set(this.#researched);
    copy.#mutation = this.#mutation;
    copy.#toxicityPlan = this.#toxicityPlan.clone();
    copy.#gear = this.#gear.clone();
    return copy;
  }

  // The elixirs and the gear have no rule that reaches back into the build, so they take their commands
  // directly. The maximum Toxicity they meet comes from the build.
  get toxicityPlan(): ToxicityPlan {
    return this.#toxicityPlan;
  }

  get gear(): GearLoadout {
    return this.#gear;
  }

  // Slots and the slotted mutation need points and research, so they need no check of their own.
  isEmpty(): boolean {
    return (
      this.#ranks.size === 0 &&
      this.#researched.size === 0 &&
      this.mutagenCount === 0 &&
      this.#toxicityPlan.isEmpty() &&
      this.#gear.isEmpty()
    );
  }

  // --- Skill points

  rank(skill: Skill): number {
    return this.#ranks.get(skill) ?? 0;
  }

  treePoints(tree: TreeName): number {
    return this.#catalog.tree(tree).skills.reduce((sum, skill) => sum + this.rank(skill), 0);
  }

  totalPoints(): number {
    let sum = this.researchCost();
    for (const rank of this.#ranks.values()) sum += rank;
    return sum;
  }

  unslottedPoints(): number {
    let sum = 0;
    for (const [skill, rank] of this.#ranks) if (this.slotOf(skill) < 0) sum += rank;
    return sum;
  }

  isAvailable(skill: Skill): boolean {
    return skill.requires.length === 0 || skill.requires.some((parent) => this.rank(parent) > 0);
  }

  canAddPoint(skill: Skill): boolean {
    return this.rank(skill) < MAX_RANK && this.isAvailable(skill);
  }

  addPoint(skill: Skill): void {
    if (this.canAddPoint(skill)) this.#ranks.set(skill, this.rank(skill) + 1);
  }

  // The last point takes along every skill that only this one kept unlocked, so a branch unwinds in one go.
  removePoint(skill: Skill): void {
    if (this.rank(skill) === 0) return;
    const rank = this.rank(skill) - 1;
    if (rank > 0) this.#ranks.set(skill, rank);
    else this.#ranks.delete(skill);
    this.#normalize();
  }

  resetTree(tree: TreeName): void {
    for (const skill of this.#catalog.tree(tree).skills) this.#ranks.delete(skill);
    this.#normalize();
  }

  // --- Skill slots

  get slotCount(): number {
    return this.#slots.length;
  }

  slotAt(index: number): Skill | null {
    return this.#slots[index] ?? null;
  }

  slotOf(skill: Skill): number {
    return this.#slots.indexOf(skill);
  }

  // A skill works only from a slot, so out of one it brings no rank.
  slottedRank(skill: Skill): number {
    return this.slotOf(skill) >= 0 ? this.rank(skill) : 0;
  }

  isSlotUnlocked(index: number): boolean {
    if (!this.#isSlotIndex(index)) return false;
    if (index < BASE_SLOTS) return true;
    const needed = this.#catalog.extraSlotUnlocks[index - BASE_SLOTS];
    return needed !== undefined && this.researchedCount >= needed;
  }

  // How many of the extra slots around the mutation research has opened.
  get unlockedExtraSlots(): number {
    const extra = Array.from(
      { length: this.slotCount - BASE_SLOTS },
      (_, each) => BASE_SLOTS + each,
    );
    return extra.filter((index) => this.isSlotUnlocked(index)).length;
  }

  // The trees the extra slots take: the colours of the slotted mutation.
  extraSlotTrees(): readonly ColourTree[] {
    return this.#mutation === null ? [] : this.#catalog.mutation(this.#mutation).trees;
  }

  slotAccepts(index: number, skill: Skill): boolean {
    if (!this.isSlotUnlocked(index) || this.rank(skill) === 0) return false;
    return (
      index < BASE_SLOTS || (this.extraSlotTrees() as readonly TreeName[]).includes(skill.tree)
    );
  }

  placeSkill(skill: Skill, index: number): void {
    const from = this.slotOf(skill);
    const displaced = this.slotAt(index);
    if (from === index || !this.slotAccepts(index, skill)) return;
    if (from >= 0) {
      // A move swaps the two slots, and only when the displaced skill also fits the slot being vacated.
      if (displaced !== null && !this.slotAccepts(from, displaced)) return;
      this.#slots[from] = displaced;
    }
    this.#slots[index] = skill;
  }

  unslot(index: number): void {
    if (this.#isSlotIndex(index)) this.#slots[index] = null;
  }

  // Every slotted skill adds its tree's bonus once per rank, and these stack across all slots.
  treeBonus(tree: TreeName): number {
    let ranks = 0;
    for (const skill of this.#slots) if (skill?.tree === tree) ranks += this.rank(skill);
    return ranks * this.#catalog.tree(tree).bonus.perRank;
  }

  // --- Mutagens

  get mutagenCount(): number {
    return this.#mutagens.filter((id) => id !== null).length;
  }

  mutagenAt(group: number): MutagenId | null {
    return this.#mutagens[group] ?? null;
  }

  placeMutagen(id: MutagenId, group: number): void {
    if (isMutagenGroup(group)) this.#mutagens[group] = id;
  }

  moveMutagen(fromGroup: number, toGroup: number): void {
    if (!isMutagenGroup(fromGroup) || !isMutagenGroup(toGroup)) return;
    const moving = this.mutagenAt(fromGroup);
    this.#mutagens[fromGroup] = this.mutagenAt(toGroup);
    this.#mutagens[toGroup] = moving;
  }

  removeMutagen(group: number): void {
    if (isMutagenGroup(group)) this.#mutagens[group] = null;
  }

  resetMutagens(): void {
    this.#mutagens.fill(null);
  }

  slotMatchesMutagen(index: number): boolean {
    if (index >= BASE_SLOTS) return false;
    const id = this.mutagenAt(slotGroup(index));
    return id !== null && this.slotAt(index)?.tree === this.#catalog.mutagen(id).tree;
  }

  // Every skill of the mutagen's colour in the same group adds the base bonus once more.
  mutagenBonus(group: number): MutagenBonus | null {
    const id = this.mutagenAt(group);
    if (id === null) return null;
    const mutagen = this.#catalog.mutagen(id);
    const groupSlots = this.#slots.slice(group * SLOTS_PER_GROUP, (group + 1) * SLOTS_PER_GROUP);
    const matching = groupSlots.filter((skill) => skill?.tree === mutagen.tree).length;
    const synergy = this.#slottedRankOf(SYNERGY.skill);
    const value = Math.floor(mutagen.bonus * (1 + matching) * (1 + synergy * SYNERGY.bonusPerRank));
    return { mutagen, matching, synergy, value };
  }

  // --- Mutations

  get researchedCount(): number {
    return this.#researched.size;
  }

  get slottedMutation(): MutationId | null {
    return this.#mutation;
  }

  researchCost(): number {
    let sum = 0;
    for (const id of this.#researched) sum += this.#catalog.mutation(id).cost;
    return sum;
  }

  isResearched(id: MutationId): boolean {
    return this.#researched.has(id) || this.#catalog.mutation(id).innate;
  }

  canResearch(id: MutationId): boolean {
    return !this.isResearched(id) && this.#requirementsResearched(id);
  }

  canSlotMutation(id: MutationId): boolean {
    return this.#researched.has(id);
  }

  research(id: MutationId): void {
    if (this.canResearch(id)) this.#researched.add(id);
  }

  // Takes along every researched mutation that needed this one, the way a skill's last point does.
  unresearch(id: MutationId): void {
    if (!this.#researched.has(id)) return;
    this.#researched.delete(id);
    this.#normalize();
  }

  slotMutation(id: MutationId): void {
    if (!this.canSlotMutation(id)) return;
    this.#mutation = id;
    this.#normalize();
  }

  unslotMutation(): void {
    this.#mutation = null;
    this.#normalize();
  }

  resetMutations(): void {
    this.#researched.clear();
    this.#mutation = null;
    this.#normalize();
  }

  // --- Toxicity: how much the skills and the armor let Geralt take

  // The Manticore armor pieces worn. Codes written before the gear existed carry a count of their own,
  // which stands until armor is picked.
  get manticorePieces(): number {
    return this.#gear.manticoreArmorPieces() ?? this.#toxicityPlan.manticorePieces;
  }

  maxToxicity(): number {
    return (
      BASE_MAX_TOXICITY +
      this.acquiredTolerance() +
      this.metabolicControl() +
      this.manticorePieces * MANTICORE_ARMOR.toxicity
    );
  }

  // Skills only work from a slot, so an unslotted one adds nothing.
  acquiredTolerance(): number {
    return (
      this.#slottedRankOf(ACQUIRED_TOLERANCE.skill) *
      ACQUIRED_TOLERANCE.perRecipe *
      this.#toxicityPlan.knownRecipes
    );
  }

  metabolicControl(): number {
    return this.#slottedRankOf(METABOLIC_CONTROL.skill) * METABOLIC_CONTROL.perRank;
  }

  // Above this much Toxicity, Geralt takes overdose damage.
  overdoseToxicity(): number {
    return this.maxToxicity() * SAFE_TOXICITY_SHARE;
  }

  // Where the slotted skills that work above a share of the maximum start to.
  toxicityThresholds(): readonly ToxicityThreshold[] {
    return TOXICITY_THRESHOLD_SKILLS.flatMap(({ skill, shares }) => {
      const share = shares[this.#slottedRankOf(skill) - 1];
      return share === undefined
        ? []
        : [{ skill: this.#catalog.keySkills[skill], toxicity: this.maxToxicity() * share }];
    });
  }

  // Only an index the board has, so a stray one cannot grow the slot list.
  #isSlotIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.#slots.length;
  }

  #slottedRankOf(key: KeySkill): number {
    return this.slottedRank(this.#catalog.keySkills[key]);
  }

  #requirementsResearched(id: MutationId): boolean {
    return this.#catalog.mutation(id).requires.every((required) => this.isResearched(required));
  }

  // Drops whatever the rules no longer allow. Removals can cascade, so it repeats until nothing changes.
  #normalize(): void {
    for (let changed = true; changed;) {
      changed = false;
      for (const skill of this.#ranks.keys()) {
        if (!this.isAvailable(skill)) {
          this.#ranks.delete(skill);
          changed = true;
        }
      }
      for (const id of this.#researched) {
        if (!this.#requirementsResearched(id)) {
          this.#researched.delete(id);
          changed = true;
        }
      }
    }
    if (this.#mutation !== null && !this.#researched.has(this.#mutation)) this.#mutation = null;
    this.#slots = this.#slots.map((skill, index) =>
      skill !== null && this.slotAccepts(index, skill) ? skill : null,
    );
  }
}
