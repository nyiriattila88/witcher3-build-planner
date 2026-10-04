import type { Mutagen, Mutation } from '../catalog/catalog';
import type { TreeName } from '../data/skills';

export const treeColour = (tree: TreeName): string => `var(--tree-${tree.toLowerCase()})`;

export const mutationColour = (mutation: Mutation): string =>
  `var(--mut-${mutation.trees.join('-').toLowerCase()})`;

export const mutagenColour = (mutagen: Mutagen): string =>
  `var(--mut-${mutagen.tree.toLowerCase()})`;
