import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { ColourTree, MutagenId, MutationId } from '../data/mutations';
import type { TreeName } from '../data/skills';
import type { BuildSnapshot } from './build-snapshot';

export const MAX_RANK = 3;
export const BASE_SLOTS = 12;
export const SLOTS_PER_GROUP = 3;
export const MUTAGEN_GROUPS = BASE_SLOTS / SLOTS_PER_GROUP;
// While it sits in a slot, Synergy raises every mutagen bonus by 10% per rank.
export const SYNERGY = { tree: 'General', name: 'Synergy', bonusPerRank: 0.1 } as const;

export const slotGroup = (slotIndex: number): number => Math.floor(slotIndex / SLOTS_PER_GROUP);

export type MutagenBonus = {
  readonly mutagen: Mutagen;
  readonly matching: number;
  readonly synergy: number;
  readonly value: number;
};

// One character build: skill ranks, slotted skills, mutagens and mutations.
// Every command leaves the build valid, so callers never have to repair it.
export class Build {
  readonly #catalog: Catalog;
  #ranks = new Map<Skill, number>();
  #slots: (Skill | null)[];
  #mutagens: (MutagenId | null)[] = Array<MutagenId | null>(MUTAGEN_GROUPS).fill(null);
  #researched = new Set<MutationId>();
  #mutation: MutationId | null = null;

  constructor(catalog: Catalog) {
    this.#catalog = catalog;
    this.#slots = Array<Skill | null>(BASE_SLOTS + catalog.extraSlotUnlocks.length).fill(null);
  }

  // Reads a saved or decoded build, skipping anything unknown or against the rules.
  static fromSnapshot(catalog: Catalog, snapshot: BuildSnapshot): Build {
    const build = new Build(catalog);
    for (const [tree, ranks] of Object.entries(snapshot.points)) {
      for (const [name, rank] of Object.entries(ranks)) {
        const skill = catalog.skill(tree, name);
        const value = Math.min(MAX_RANK, Math.max(0, Math.trunc(rank)));
        if (skill !== undefined && value > 0) build.#ranks.set(skill, value);
      }
    }
    for (const id of snapshot.researched) {
      const mutation = catalog.mutation(id);
      if (mutation !== undefined && !mutation.innate) build.#researched.add(mutation.id);
    }
    build.#mutation = catalog.mutation(snapshot.mutation)?.id ?? null;
    snapshot.mutagens.slice(0, MUTAGEN_GROUPS).forEach((id, group) => {
      build.#mutagens[group] = catalog.mutagen(id)?.id ?? null;
    });
    snapshot.slots.slice(0, build.slotCount).forEach((entry, index) => {
      const skill = entry === null ? undefined : catalog.skill(entry.tree, entry.name);
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
    return copy;
  }

  // Slots and the slotted mutation need points and research, so these three cover everything.
  isEmpty(): boolean {
    return this.#ranks.size === 0 && this.#researched.size === 0 && this.mutagenCount === 0;
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

  // The last point stays while a learned skill has no other learned parent to keep it unlocked.
  canRemovePoint(skill: Skill): boolean {
    const rank = this.rank(skill);
    if (rank === 0) return false;
    if (rank > 1) return true;
    return skill.unlocks.every(
      (child) =>
        this.rank(child) === 0 ||
        child.requires.some((parent) => parent !== skill && this.rank(parent) > 0),
    );
  }

  addPoint(skill: Skill): void {
    if (this.canAddPoint(skill)) this.#ranks.set(skill, this.rank(skill) + 1);
  }

  removePoint(skill: Skill): void {
    if (!this.canRemovePoint(skill)) return;
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

  isSlotUnlocked(index: number): boolean {
    if (index < BASE_SLOTS) return true;
    const needed = this.#catalog.extraSlotUnlocks[index - BASE_SLOTS];
    return needed !== undefined && this.researchedCount >= needed;
  }

  // The trees the extra slots take: the colours of the slotted mutation.
  extraSlotTrees(): readonly ColourTree[] {
    return this.#catalog.mutation(this.#mutation)?.trees ?? [];
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
    this.#slots[index] = null;
  }

  // --- Mutagens

  get mutagenCount(): number {
    return this.#mutagens.filter((id) => id !== null).length;
  }

  mutagenAt(group: number): MutagenId | null {
    return this.#mutagens[group] ?? null;
  }

  placeMutagen(id: MutagenId, group: number): void {
    if (group >= 0 && group < MUTAGEN_GROUPS) this.#mutagens[group] = id;
  }

  moveMutagen(fromGroup: number, toGroup: number): void {
    const moving = this.mutagenAt(fromGroup);
    this.#mutagens[fromGroup] = this.mutagenAt(toGroup);
    this.#mutagens[toGroup] = moving;
  }

  removeMutagen(group: number): void {
    this.#mutagens[group] = null;
  }

  resetMutagens(): void {
    this.#mutagens.fill(null);
  }

  slotMatchesMutagen(index: number): boolean {
    if (index >= BASE_SLOTS) return false;
    const mutagen = this.#catalog.mutagen(this.mutagenAt(slotGroup(index)));
    return mutagen !== undefined && this.slotAt(index)?.tree === mutagen.tree;
  }

  // Every skill of the mutagen's colour in the same group adds the base bonus once more.
  mutagenBonus(group: number): MutagenBonus | null {
    const mutagen = this.#catalog.mutagen(this.mutagenAt(group));
    if (mutagen === undefined) return null;
    const groupSlots = this.#slots.slice(group * SLOTS_PER_GROUP, (group + 1) * SLOTS_PER_GROUP);
    const matching = groupSlots.filter((skill) => skill?.tree === mutagen.tree).length;
    const synergySkill = this.#catalog.skill(SYNERGY.tree, SYNERGY.name);
    const synergy =
      synergySkill !== undefined && this.slotOf(synergySkill) >= 0 ? this.rank(synergySkill) : 0;
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
    for (const id of this.#researched) sum += this.#mutationById(id).cost;
    return sum;
  }

  isResearched(id: MutationId): boolean {
    return this.#researched.has(id) || this.#mutationById(id).innate;
  }

  canResearch(id: MutationId): boolean {
    return !this.isResearched(id) && this.#requirementsResearched(id);
  }

  // A mutation stays while another researched mutation requires it.
  canUnresearch(id: MutationId): boolean {
    return (
      this.#researched.has(id) &&
      ![...this.#researched].some((other) => this.#mutationById(other).requires.includes(id))
    );
  }

  canSlotMutation(id: MutationId): boolean {
    return this.#researched.has(id);
  }

  research(id: MutationId): void {
    if (this.canResearch(id)) this.#researched.add(id);
  }

  unresearch(id: MutationId): void {
    if (!this.canUnresearch(id)) return;
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

  #mutationById(id: MutationId): Mutation {
    const mutation = this.#catalog.mutation(id);
    if (mutation === undefined) throw new Error(`Unknown mutation "${id}"`);
    return mutation;
  }

  #requirementsResearched(id: MutationId): boolean {
    return this.#mutationById(id).requires.every((required) => this.isResearched(required));
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
