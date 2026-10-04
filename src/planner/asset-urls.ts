import type { Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { DecoctionData, PotionData } from '../data/alchemy';

// Files under public/ are served below the base path, which is the repository name on GitHub Pages.
// GitHub Pages lets a browser keep a file for ten minutes, so the release in the query makes it fetch
// an image a release has replaced under the same name.
const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path}?v=${__APP_VERSION__}`;

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

// The files drop the apostrophe of a name like Petri's Philter.
const elixirSlug = (name: string): string => slug(name.replace(/'/g, ''));

export const potionIconUrl = (potion: PotionData): string =>
  assetUrl(`images/potions/${elixirSlug(potion.name)}.png`);

export const decoctionIconUrl = (decoction: DecoctionData): string =>
  assetUrl(`images/decoctions/${elixirSlug(decoction.name)}.png`);
