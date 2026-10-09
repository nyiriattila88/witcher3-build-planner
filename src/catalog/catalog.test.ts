import { describe, expect, it } from 'vitest';
import { MUTAGENS, MUTATIONS, type MutationId } from '../data/mutations';
import { KEY_SKILLS, SKILL_TREES } from '../data/skills';
import { TREE_LAYOUT } from '../data/tree-layout';
import { createCatalog } from './catalog';
import { createGameCatalog } from './game-catalog';

const names = (skills: readonly { readonly name: string }[]): string[] =>
  skills.map((skill) => skill.name).sort();

// The game data with another tree layout, for the tests of broken data.
const createWithLayout = (treeLayout: typeof TREE_LAYOUT): unknown =>
  createCatalog({
    skillTrees: SKILL_TREES,
    keySkills: KEY_SKILLS,
    treeLayout,
    mutagens: MUTAGENS,
    mutations: MUTATIONS,
    extraSlotUnlocks: [2, 4, 8, 12],
    potions: [],
    decoctions: [],
    gear: [],
    setBonuses: [],
    upgrades: [],
    enchantments: [],
  });

describe('createCatalog', () => {
  it('holds every skill of the four trees with the links of the in-game screenshots', () => {
    const catalog = createGameCatalog();

    expect(catalog.skills).toHaveLength(80);
    expect(catalog.trees.map((tree) => tree.links.length)).toEqual([27, 26, 28, 32]);
  });

  it('takes the prerequisites from the screenshots, not from the Reddit text', () => {
    const catalog = createGameCatalog();

    const rend = catalog.findSkill('Combat', 'Rend');
    const floodOfAnger = catalog.findSkill('Combat', 'Flood of Anger');

    expect(names(rend?.requires ?? [])).toEqual(['Crushing Blow', 'Razor Focus', 'Whirl']);
    expect(names(floodOfAnger?.requires ?? [])).not.toContain('Razor Focus');
  });

  it('opens the General links both ways, but never into a School Techniques', () => {
    const catalog = createGameCatalog();

    const attunement = catalog.findSkill('General', 'Elemental Attunement');
    const cat = catalog.findSkill('General', 'Cat School Techniques');

    expect(names(attunement?.requires ?? [])).toEqual([
      'Advanced Pyrotechnics',
      'Element of Surprise',
      'Gourmand',
    ]);
    expect(cat?.requires).toEqual([]);
  });

  it('marks Strengthened Synapses as the only innate mutation', () => {
    const catalog = createGameCatalog();

    const innate = catalog.mutations.filter((mutation) => mutation.innate);

    expect(innate.map((mutation) => mutation.id)).toEqual(['strengthened-synapses']);
  });

  it('ends every rank text with the bonus its tree gives at that rank', () => {
    const catalog = createGameCatalog();

    const mismatched = catalog.trees.flatMap(({ bonus, skills }) =>
      skills.filter((skill) =>
        skill.ranks.some(
          (text, i) => !text.endsWith(`\n${bonus.stat}: +${bonus.perRank * (i + 1)}${bonus.unit}`),
        ),
      ),
    );

    expect(names(mismatched)).toEqual([]);
  });

  it('refuses data whose link names a skill that does not exist', () => {
    const brokenLayout = {
      ...TREE_LAYOUT,
      Combat: {
        ...TREE_LAYOUT.Combat,
        links: [...TREE_LAYOUT.Combat.links, ['Muscle Memory', 'Nonexistent'] as const],
      },
    };

    const create = (): unknown => createWithLayout(brokenLayout);

    expect(create).toThrow(/Nonexistent/);
  });

  it('refuses a starting skill its tree does not have', () => {
    const brokenLayout = {
      ...TREE_LAYOUT,
      General: {
        ...TREE_LAYOUT.General,
        unlocking: { kind: 'network', starts: ['Nonexistent'] } as const,
      },
    };

    const create = (): unknown => createWithLayout(brokenLayout);

    expect(create).toThrow(/Nonexistent/);
  });

  it('resolves the skills the rules read once, when it is made', () => {
    const catalog = createGameCatalog();

    const resolved = Object.values(catalog.keySkills).map((skill) => `${skill.tree}/${skill.name}`);

    expect(resolved).toEqual([
      'General/Synergy',
      'Alchemy/Acquired Tolerance',
      'General/Metabolic Control',
      'Alchemy/Delayed Recovery',
      'Alchemy/High Tolerance',
    ]);
  });

  it('refuses data that no longer has a skill the rules read', () => {
    const renamed = { ...KEY_SKILLS, synergy: { tree: 'General', name: 'Synergy II' } } as const;

    const create = (): unknown =>
      createCatalog({
        skillTrees: SKILL_TREES,
        keySkills: renamed,
        treeLayout: TREE_LAYOUT,
        mutagens: MUTAGENS,
        mutations: MUTATIONS,
        extraSlotUnlocks: [2, 4, 8, 12],
        potions: [],
        decoctions: [],
        gear: [],
        setBonuses: [],
        upgrades: [],
        enchantments: [],
      });

    expect(create).toThrow(/Synergy II/);
  });

  it('finds a name read from outside, and nothing for one it does not know', () => {
    const catalog = createGameCatalog();

    const found = [
      catalog.findSkill('Combat', 'Rend')?.name,
      catalog.findSkill('Combat', 'Nonexistent'),
      catalog.findMutagen('green')?.name,
      catalog.findMutation('not-a-mutation'),
    ];

    expect(found).toEqual(['Rend', undefined, 'Green Mutagen', undefined]);
  });

  it('stops at an unknown id, which only a programmer error can bring', () => {
    const catalog = createGameCatalog();

    const lookUp = (): unknown => catalog.mutation('not-a-mutation' as MutationId);

    expect(lookUp).toThrow(/not-a-mutation/);
  });
});
