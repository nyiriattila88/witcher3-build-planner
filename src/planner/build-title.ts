import type { Build } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import type { ColourTree } from '../data/mutations';

const COLOUR_TREES: readonly ColourTree[] = ['Combat', 'Signs', 'Alchemy'];

// Named after the two strongest colour trees and the slotted mutation, as the rpg-gaming planner does.
export function buildTitle(build: Build, catalog: Catalog): string {
  const trees = COLOUR_TREES.map((tree) => ({ tree, points: build.treePoints(tree) }))
    .filter(({ points }) => points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 2)
    .map(({ tree }) => tree);
  const mutation = catalog.mutation(build.slottedMutation);
  return [trees.join(' / '), mutation?.name ?? ''].filter((part) => part !== '').join(' - ');
}
