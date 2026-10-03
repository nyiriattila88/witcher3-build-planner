import type { DecoctionData, PotionData } from '../data/alchemy';
import type { GearItemData, GearSchool, GearSlot, SetBonusData } from '../data/gear';
import type {
  ColourTree,
  MutagenData,
  MutagenId,
  MutationData,
  MutationId,
} from '../data/mutations';
import type { SkillTreeData, TreeBonus, TreeName } from '../data/skills';
import type { TreeLayout } from '../data/tree-layout';
import type { EnchantmentData, UpgradeData } from '../data/upgrades';

export type Skill = {
  readonly index: number;
  readonly tree: TreeName;
  readonly name: string;
  readonly ranks: readonly [string, string, string];
  readonly position: readonly [number, number];
  readonly requires: readonly Skill[];
  readonly unlocks: readonly Skill[];
};

export type SkillTree = {
  readonly name: TreeName;
  readonly bonus: TreeBonus;
  readonly skills: readonly Skill[];
  readonly links: readonly (readonly [Skill, Skill])[];
};

export type Mutagen = MutagenData & { readonly id: MutagenId };

export type Mutation = Omit<MutationData, 'innate' | 'requires' | 'trees'> & {
  readonly id: MutationId;
  readonly innate: boolean;
  readonly requires: readonly MutationId[];
  readonly trees: readonly ColourTree[];
};

export type Catalog = {
  readonly trees: readonly SkillTree[];
  readonly skills: readonly Skill[];
  readonly mutagens: readonly Mutagen[];
  readonly mutations: readonly Mutation[];
  readonly extraSlotUnlocks: readonly number[];
  readonly potions: readonly PotionData[];
  readonly decoctions: readonly DecoctionData[];
  readonly gear: readonly GearItemData[];
  // The final version of every school's item for every slot, in the order of the gear.
  readonly finalGear: readonly GearItemData[];
  // One entry per school, in the order of the gear.
  readonly setBonuses: readonly SetBonusData[];
  readonly upgrades: readonly UpgradeData[];
  readonly enchantments: readonly EnchantmentData[];
  readonly tree: (name: TreeName) => SkillTree;
  // Every version of the school's item for the slot of this one, by level, the final one last.
  readonly versions: (item: GearItemData) => readonly GearItemData[];
  // The most sockets any item for the slot has.
  readonly maxSockets: (slot: GearSlot) => number;
  readonly setBonus: (school: GearSchool) => SetBonusData;
  readonly skill: (tree: string, name: string) => Skill | undefined;
  readonly mutagen: (id: string | null) => Mutagen | undefined;
  readonly mutation: (id: string | null) => Mutation | undefined;
};

export type CatalogSources = {
  readonly skillTrees: readonly SkillTreeData[];
  readonly treeLayout: Readonly<Record<TreeName, TreeLayout>>;
  readonly mutagens: Readonly<Record<MutagenId, MutagenData>>;
  readonly mutations: Readonly<Record<MutationId, MutationData>>;
  readonly extraSlotUnlocks: readonly number[];
  readonly potions: readonly PotionData[];
  readonly decoctions: readonly DecoctionData[];
  readonly gear: readonly GearItemData[];
  readonly setBonuses: readonly SetBonusData[];
  readonly upgrades: readonly UpgradeData[];
  readonly enchantments: readonly EnchantmentData[];
};

type MutableSkill = Omit<Skill, 'requires' | 'unlocks'> & { requires: Skill[]; unlocks: Skill[] };

const skillKey = (tree: string, name: string): string => `${tree}/${name}`;

// A school's item for one slot, through all of its versions.
const gearLineKey = (item: GearItemData): string => `${item.school}/${item.slot}`;

const assertUnique = (what: string, items: readonly { readonly name: string }[]): void => {
  const names = items.map((item) => item.name);
  const repeated = names.filter((name, i) => names.indexOf(name) !== i);
  if (repeated.length > 0) throw new Error(`${what} listed twice: ${repeated.join(', ')}`);
};

// Joins the data files into lookups. A broken reference in the data is a programmer error and stops the start.
export function createCatalog(sources: CatalogSources): Catalog {
  const skillsByKey = new Map<string, MutableSkill>();
  const skills: MutableSkill[] = [];

  const trees = sources.skillTrees.map((treeData): SkillTree => {
    const layout = sources.treeLayout[treeData.tree];
    const treeSkills = treeData.skills.map((skillData) => {
      const position = layout.nodes[skillData.name];
      if (position === undefined) {
        throw new Error(`No tree position for ${treeData.tree} skill "${skillData.name}"`);
      }
      const skill: MutableSkill = {
        index: skills.length,
        tree: treeData.tree,
        name: skillData.name,
        ranks: skillData.ranks,
        position,
        requires: [],
        unlocks: [],
      };
      skills.push(skill);
      skillsByKey.set(skillKey(treeData.tree, skillData.name), skill);
      return skill;
    });

    const links = layout.links.map(([parentName, childName]): readonly [Skill, Skill] => {
      const parent = skillsByKey.get(skillKey(treeData.tree, parentName));
      const child = skillsByKey.get(skillKey(treeData.tree, childName));
      if (parent === undefined || child === undefined) {
        throw new Error(`Unknown skill in the ${treeData.tree} link ${parentName} -> ${childName}`);
      }
      parent.unlocks.push(child);
      child.requires.push(parent);
      return [parent, child];
    });

    return { name: treeData.tree, bonus: treeData.bonus, skills: treeSkills, links };
  });

  // Object.keys returns string[] even for a record keyed by a union of literal ids.
  const mutagenIds = Object.keys(sources.mutagens) as MutagenId[];
  const mutationIds = Object.keys(sources.mutations) as MutationId[];
  const isMutationId = (id: string): id is MutationId => (mutationIds as string[]).includes(id);

  const mutagens = mutagenIds.map((id): Mutagen => ({ id, ...sources.mutagens[id] }));
  const mutations = mutationIds.map((id): Mutation => {
    const { innate, requires, ...data } = sources.mutations[id];
    const unknown = requires.filter((required) => !isMutationId(required));
    if (unknown.length > 0) {
      throw new Error(`Mutation "${id}" requires unknown mutations: ${unknown.join(', ')}`);
    }
    return { ...data, id, innate: innate === true, requires: requires.filter(isMutationId) };
  });

  // The planner finds elixirs, gear and upgrades by name, so a name may only appear once in its list.
  assertUnique('Potion or decoction', [...sources.potions, ...sources.decoctions]);
  assertUnique('Gear', sources.gear);
  assertUnique('Rune or glyph', sources.upgrades);
  assertUnique('Enchantment', sources.enchantments);

  const setBonusesBySchool = new Map(sources.setBonuses.map((set) => [set.school, set]));
  const schoolless = sources.gear.filter((item) => !setBonusesBySchool.has(item.school));
  if (schoolless.length > 0) {
    throw new Error(`Gear of a school without set bonuses: ${schoolless[0]?.name ?? ''}`);
  }

  const versionsByLine = new Map<string, GearItemData[]>();
  for (const item of sources.gear) {
    const key = gearLineKey(item);
    const line = versionsByLine.get(key) ?? [];
    const previous = line.at(-1);
    if (previous !== undefined && previous.level > item.level) {
      throw new Error(`${item.name} comes after the higher level ${previous.name}`);
    }
    if (line.some((other) => other.tier === item.tier)) {
      throw new Error(`${item.name} shares its tier with another version`);
    }
    versionsByLine.set(key, [...line, item]);
  }
  const versions = (item: GearItemData): readonly GearItemData[] =>
    versionsByLine.get(gearLineKey(item)) ?? [item];
  const finalGear = sources.gear.filter((item) => versions(item).at(-1) === item);

  // The build code keeps what is planned for a slot in the sockets of a final item, so every final item
  // needs the most sockets of its slot.
  const maxSockets = (slot: GearSlot): number =>
    Math.max(0, ...sources.gear.filter((item) => item.slot === slot).map((item) => item.sockets));
  const short = finalGear.find((item) => item.sockets < maxSockets(item.slot));
  if (short !== undefined) {
    throw new Error(`${short.name} has fewer sockets than other gear for its slot`);
  }

  const treesByName = new Map(trees.map((tree) => [tree.name, tree]));
  const mutagensById = new Map<string, Mutagen>(mutagens.map((mutagen) => [mutagen.id, mutagen]));
  const mutationsById = new Map<string, Mutation>(
    mutations.map((mutation) => [mutation.id, mutation]),
  );

  return {
    trees,
    skills,
    mutagens,
    mutations,
    extraSlotUnlocks: sources.extraSlotUnlocks,
    potions: sources.potions,
    decoctions: sources.decoctions,
    gear: sources.gear,
    finalGear,
    setBonuses: sources.setBonuses,
    upgrades: sources.upgrades,
    enchantments: sources.enchantments,
    tree: (name) => {
      const tree = treesByName.get(name);
      if (tree === undefined) throw new Error(`Unknown skill tree "${name}"`);
      return tree;
    },
    versions,
    maxSockets,
    setBonus: (school) => {
      const set = setBonusesBySchool.get(school);
      if (set === undefined) throw new Error(`No set bonuses for the ${school} school`);
      return set;
    },
    skill: (tree, name) => skillsByKey.get(skillKey(tree, name)),
    mutagen: (id) => (id === null ? undefined : mutagensById.get(id)),
    mutation: (id) => (id === null ? undefined : mutationsById.get(id)),
  };
}
