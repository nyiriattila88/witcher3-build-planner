import type { Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { TreeName } from '../data/skills';

// Files under public/ are served below the base path, which is the repository name on GitHub Pages.
const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`;

const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const iconUrl = (skill: Skill): string =>
  assetUrl(`images/${skill.tree.toLowerCase()}/${slug(skill.name)}.png`);

export const backgroundUrl = (name: string): string => assetUrl(`images/backgrounds/${name}.jpg`);

// The faint double helix behind the slot board, as on the in-game character screen.
export const helixUrl = assetUrl('images/backgrounds/helix.svg');

export const mutationIconUrl = (mutation: Mutation): string =>
  assetUrl(`images/mutations/${mutation.id}.png`);

export const mutagenIconUrl = (mutagen: Mutagen): string =>
  assetUrl(`images/mutagens/${mutagen.id}.png`);

export const treeColour = (tree: TreeName): string => `var(--tree-${tree.toLowerCase()})`;

export const mutationColour = (mutation: Mutation): string =>
  `var(--mut-${mutation.trees.join('-').toLowerCase()})`;

export const mutagenColour = (mutagen: Mutagen): string =>
  `var(--mut-${mutagen.tree.toLowerCase()})`;

// The diamonds show the name without the word "Mutagen", the info panel and the summary show it whole.
export const mutagenLabel = (mutagen: Mutagen): string => mutagen.name.replace(/ Mutagen$/, '');

export const mutagenEffect = (mutagen: Mutagen, value: number): string =>
  `${mutagen.effect} +${value}${mutagen.unit}`;
