import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import {
  ALCHEMY_RECIPES,
  BASE_MAX_TOXICITY,
  MANTICORE_ARMOR,
  SAFE_TOXICITY_SHARE,
  type DecoctionData,
  type PotionData,
} from '../data/alchemy';
import type { GearItemData, GearSchool, GearSlot, StatBonus } from '../data/gear';
import type { ColourTree, MutagenId, MutationId } from '../data/mutations';
import type { TreeName } from '../data/skills';
import { ENCHANTMENT_SOCKETS, type EnchantmentData, type UpgradeData } from '../data/upgrades';
import type { BuildSnapshot } from './build-snapshot';

export const MAX_RANK = 3;
export const BASE_SLOTS = 12;
export const SLOTS_PER_GROUP = 3;
export const MUTAGEN_GROUPS = BASE_SLOTS / SLOTS_PER_GROUP;
// While it sits in a slot, Synergy raises every mutagen bonus by 10% per rank.
export const SYNERGY = { tree: 'General', name: 'Synergy', bonusPerRank: 0.1 } as const;
// From a slot, Acquired Tolerance raises maximum Toxicity by 1 per learned recipe and rank, Metabolic
// Control by 10 per rank.
export const ACQUIRED_TOLERANCE = {
  tree: 'Alchemy',
  name: 'Acquired Tolerance',
  perRecipe: 1,
} as const;
export const METABOLIC_CONTROL = {
  tree: 'General',
  name: 'Metabolic Control',
  perRank: 10,
} as const;

export const slotGroup = (slotIndex: number): number => Math.floor(slotIndex / SLOTS_PER_GROUP);

const SWORD_SLOTS: readonly GearSlot[] = ['steel', 'silver'];
const ARMOR_SLOTS: readonly GearSlot[] = ['armor', 'gloves', 'trousers', 'boots'];
// Pieces of one school that bring its first and its second set bonus.
export const SET_PIECES = { first: 3, full: 6 } as const;

// A sword takes runes and a runeword, an armor piece glyphs, and only the chest armor a glyphword.
export const upgradeKind = (slot: GearSlot): UpgradeData['kind'] =>
  SWORD_SLOTS.includes(slot) ? 'rune' : 'glyph';

const enchantmentKind = (slot: GearSlot): EnchantmentData['kind'] | null =>
  SWORD_SLOTS.includes(slot) ? 'runeword' : slot === 'armor' ? 'glyphword' : null;

export const holdsEnchantment = (item: GearItemData, enchantment: EnchantmentData): boolean =>
  item.sockets >= ENCHANTMENT_SOCKETS && enchantment.kind === enchantmentKind(item.slot);

export type MutagenBonus = {
  readonly mutagen: Mutagen;
  readonly matching: number;
  readonly synergy: number;
  readonly value: number;
};

// One character build: skill ranks, slotted skills, mutagens, mutations and the potions and decoctions
// planned to be active together.
// Every command leaves the build valid, so callers never have to repair it.
export class Build {
  readonly #catalog: Catalog;
  #ranks = new Map<Skill, number>();
  #slots: (Skill | null)[];
  #mutagens: (MutagenId | null)[] = Array<MutagenId | null>(MUTAGEN_GROUPS).fill(null);
  #researched = new Set<MutationId>();
  #mutation: MutationId | null = null;
  #potions = new Map<PotionData, number>();
  #decoctions = new Set<DecoctionData>();
  #manticorePieces = 0;
  #knownRecipes: number = ALCHEMY_RECIPES;
  #gear = new Map<GearSlot, GearItemData>();
  #upgrades = new Map<GearSlot, (UpgradeData | null)[]>();
  #enchantments = new Map<GearSlot, EnchantmentData>();

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
    copy.#potions = new Map(this.#potions);
    copy.#decoctions = new Set(this.#decoctions);
    copy.#manticorePieces = this.#manticorePieces;
    copy.#knownRecipes = this.#knownRecipes;
    copy.#gear = new Map(this.#gear);
    copy.#upgrades = new Map([...this.#upgrades].map(([slot, held]) => [slot, [...held]]));
    copy.#enchantments = new Map(this.#enchantments);
    return copy;
  }

  // Slots and the slotted mutation need points and research, so they need no check of their own.
  isEmpty(): boolean {
    return (
      this.#ranks.size === 0 &&
      this.#researched.size === 0 &&
      this.mutagenCount === 0 &&
      this.#potions.size === 0 &&
      this.#decoctions.size === 0 &&
      this.#manticorePieces === 0 &&
      this.#knownRecipes === ALCHEMY_RECIPES &&
      this.#gear.size === 0
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

  // --- Potions, decoctions and Toxicity

  // The active version of a potion: 0 for none, then the base, enhanced and superior one.
  potionTier(potion: PotionData): number {
    return this.#potions.get(potion) ?? 0;
  }

  setPotionTier(potion: PotionData, tier: number): void {
    const value = Math.min(potion.tiers.length, Math.max(0, Math.trunc(tier)));
    if (value > 0) this.#potions.set(potion, value);
    else this.#potions.delete(potion);
  }

  isDecoctionActive(decoction: DecoctionData): boolean {
    return this.#decoctions.has(decoction);
  }

  setDecoctionActive(decoction: DecoctionData, active: boolean): void {
    if (active) this.#decoctions.add(decoction);
    else this.#decoctions.delete(decoction);
  }

  // The game refuses a potion or decoction whose Toxicity would take the total above the maximum. The
  // plan can still end up above it when the maximum drops later, which the planner shows as a warning.
  canSetPotionTier(potion: PotionData, tier: number): boolean {
    const held = potion.tiers[this.potionTier(potion) - 1]?.toxicity ?? 0;
    const next = potion.tiers[tier - 1]?.toxicity ?? 0;
    return next <= held || this.toxicity() - held + next <= this.maxToxicity();
  }

  canActivateDecoction(decoction: DecoctionData): boolean {
    return (
      this.isDecoctionActive(decoction) ||
      this.toxicity() + decoction.toxicity <= this.maxToxicity()
    );
  }

  // The Manticore armor pieces worn. Codes written before the gear existed carry a count of their own,
  // which stands until armor is picked.
  get manticorePieces(): number {
    const armor = ARMOR_SLOTS.flatMap((slot) => this.#gear.get(slot) ?? []);
    return armor.length > 0
      ? armor.filter((item) => item.school === 'Manticore').length
      : this.#manticorePieces;
  }

  setManticorePieces(pieces: number): void {
    this.#manticorePieces = Math.min(MANTICORE_ARMOR.pieces, Math.max(0, Math.trunc(pieces)));
  }

  get knownRecipes(): number {
    return this.#knownRecipes;
  }

  setKnownRecipes(count: number): void {
    this.#knownRecipes = Math.min(ALCHEMY_RECIPES, Math.max(0, Math.trunc(count)));
  }

  resetElixirs(): void {
    this.#potions.clear();
    this.#decoctions.clear();
  }

  // Everything active at once: a decoction holds its Toxicity for as long as it lasts.
  toxicity(): number {
    let sum = 0;
    for (const [potion, tier] of this.#potions) sum += potion.tiers[tier - 1]?.toxicity ?? 0;
    for (const decoction of this.#decoctions) sum += decoction.toxicity;
    return sum;
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
      this.#slottedRank(ACQUIRED_TOLERANCE) * ACQUIRED_TOLERANCE.perRecipe * this.#knownRecipes
    );
  }

  metabolicControl(): number {
    return this.#slottedRank(METABOLIC_CONTROL) * METABOLIC_CONTROL.perRank;
  }

  // Above this much Toxicity, Geralt takes overdose damage.
  overdoseToxicity(): number {
    return this.maxToxicity() * SAFE_TOXICITY_SHARE;
  }

  // --- Gear

  gearAt(slot: GearSlot): GearItemData | null {
    return this.#gear.get(slot) ?? null;
  }

  get gearCount(): number {
    return this.#gear.size;
  }

  // Another version of the school's item keeps the runes, glyphs and enchantment that still fit, the
  // way upgrading keeps them in the game. Any other item comes with empty sockets.
  equip(slot: GearSlot, item: GearItemData | null): void {
    const worn = this.gearAt(slot);
    if (worn === item || (item !== null && item.slot !== slot)) return;
    const upgrades = this.#upgrades.get(slot) ?? [];
    const enchantment = this.enchantmentAt(slot);
    this.#upgrades.delete(slot);
    this.#enchantments.delete(slot);
    if (item === null) {
      this.#gear.delete(slot);
      return;
    }
    this.#gear.set(slot, item);
    if (worn?.school !== item.school) return;
    upgrades.slice(0, item.sockets).forEach((upgrade, socket) => {
      this.setUpgrade(slot, socket, upgrade);
    });
    if (enchantment !== null) this.enchant(slot, enchantment);
  }

  upgradeAt(slot: GearSlot, socket: number): UpgradeData | null {
    return this.#upgrades.get(slot)?.[socket] ?? null;
  }

  canUpgrade(slot: GearSlot, socket: number, upgrade: UpgradeData): boolean {
    const sockets = this.gearAt(slot)?.sockets ?? 0;
    return (
      socket >= 0 &&
      socket < sockets &&
      upgrade.kind === upgradeKind(slot) &&
      !this.#enchantments.has(slot)
    );
  }

  setUpgrade(slot: GearSlot, socket: number, upgrade: UpgradeData | null): void {
    const sockets = this.gearAt(slot)?.sockets ?? 0;
    if (socket < 0 || socket >= sockets) return;
    if (upgrade !== null && !this.canUpgrade(slot, socket, upgrade)) return;
    const held = this.#upgrades.get(slot) ?? Array<UpgradeData | null>(sockets).fill(null);
    held[socket] = upgrade;
    this.#upgrades.set(slot, held);
  }

  enchantmentAt(slot: GearSlot): EnchantmentData | null {
    return this.#enchantments.get(slot) ?? null;
  }

  canEnchant(slot: GearSlot, enchantment: EnchantmentData): boolean {
    const item = this.gearAt(slot);
    return item !== null && holdsEnchantment(item, enchantment);
  }

  // An enchantment fills every socket, so the runes or glyphs in them go.
  enchant(slot: GearSlot, enchantment: EnchantmentData | null): void {
    if (this.enchantmentAt(slot) === enchantment) return;
    if (enchantment === null) {
      this.#enchantments.delete(slot);
      return;
    }
    if (!this.canEnchant(slot, enchantment)) return;
    this.#enchantments.set(slot, enchantment);
    this.#upgrades.delete(slot);
  }

  resetGear(): void {
    this.#gear.clear();
    this.#upgrades.clear();
    this.#enchantments.clear();
  }

  // Only the final version of a school's item counts towards its set bonuses.
  setPieces(school: GearSchool): number {
    return [...this.#gear.values()].filter(
      (item) => item.school === school && this.#catalog.versions(item).at(-1) === item,
    ).length;
  }

  armorValue(): number {
    return [...this.#gear.values()].reduce((sum, item) => sum + (item.armor ?? 0), 0);
  }

  // What the worn items and their runes and glyphs add, one entry per stat.
  gearBonuses(): readonly StatBonus[] {
    const items = [...this.#gear.values()].flatMap((item) => item.bonuses);
    const upgrades = [...this.#upgrades.values()]
      .flat()
      .flatMap((each) => (each === null ? [] : [each.bonus]));
    const totals = new Map<string, StatBonus>();
    for (const [stat, value, unit] of [...items, ...upgrades]) {
      const key = `${stat.toLowerCase()}|${unit}`;
      totals.set(key, [stat, (totals.get(key)?.[1] ?? 0) + value, unit]);
    }
    return [...totals.values()];
  }

  #slottedRank({ tree, name }: { readonly tree: string; readonly name: string }): number {
    const skill = this.#catalog.skill(tree, name);
    return skill !== undefined && this.slotOf(skill) >= 0 ? this.rank(skill) : 0;
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
