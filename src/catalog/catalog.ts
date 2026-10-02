import type { DecoctionData, PotionData } from '../data/alchemy';
import type {
  ColourTree,
  MutagenData,
  MutagenId,
  MutationData,
  MutationId,
} from '../data/mutations';
import type { SkillTreeData, TreeBonus, TreeName } from '../data/skills';
import type { TreeLayout } from '../data/tree-layout';

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
  readonly tree: (name: TreeName) => SkillTree;
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
};

type MutableSkill = Omit<Skill, 'requires' | 'unlocks'> & { requires: Skill[]; unlocks: Skill[] };

const skillKey = (tree: string, name: string): string => `${tree}/${name}`;

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

  // A build keeps its potions and decoctions by name, so a name may only appear once.
  const elixirNames = [...sources.potions, ...sources.decoctions].map((elixir) => elixir.name);
  const repeated = elixirNames.filter((name, i) => elixirNames.indexOf(name) !== i);
  if (repeated.length > 0)
    throw new Error(`Potion or decoction listed twice: ${repeated.join(', ')}`);

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
    tree: (name) => {
      const tree = treesByName.get(name);
      if (tree === undefined) throw new Error(`Unknown skill tree "${name}"`);
      return tree;
    },
    skill: (tree, name) => skillsByKey.get(skillKey(tree, name)),
    mutagen: (id) => (id === null ? undefined : mutagensById.get(id)),
    mutation: (id) => (id === null ? undefined : mutationsById.get(id)),
  };
}
