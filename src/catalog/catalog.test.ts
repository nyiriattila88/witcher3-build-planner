import { describe, expect, it } from 'vitest';
import { MUTAGENS, MUTATIONS } from '../data/mutations';
import { SKILL_TREES } from '../data/skills';
import { TREE_LAYOUT } from '../data/tree-layout';
import { createCatalog } from './catalog';
import { createGameCatalog } from './game-catalog';

const names = (skills: readonly { readonly name: string }[]): string[] =>
  skills.map((skill) => skill.name).sort();

describe('createCatalog', () => {
  it('holds every skill of the four trees with the links of the in-game screenshots', () => {
    const catalog = createGameCatalog();

    expect(catalog.skills).toHaveLength(80);
    expect(catalog.trees.map((tree) => tree.links.length)).toEqual([27, 26, 28, 32]);
  });

  it('takes the prerequisites from the screenshots, not from the Reddit text', () => {
    const catalog = createGameCatalog();

    const rend = catalog.skill('Combat', 'Rend');
    const floodOfAnger = catalog.skill('Combat', 'Flood of Anger');

    expect(names(rend?.requires ?? [])).toEqual(['Crushing Blow', 'Razor Focus', 'Whirl']);
    expect(names(floodOfAnger?.requires ?? [])).not.toContain('Razor Focus');
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

    const create = (): unknown =>
      createCatalog({
        skillTrees: SKILL_TREES,
        treeLayout: brokenLayout,
        mutagens: MUTAGENS,
        mutations: MUTATIONS,
        extraSlotUnlocks: [2, 4, 8, 12],
        potions: [],
        decoctions: [],
      });

    expect(create).toThrow(/Nonexistent/);
  });
});
