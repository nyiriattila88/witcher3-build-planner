import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { DecoctionData, PotionData } from '../data/alchemy';
import type { GearItemData, GearSlot, SetBonusData, StatBonus } from '../data/gear';
import type { TreeName } from '../data/skills';

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

// Superior Swallow, or the potion's own name when it comes in one version only.
export const potionTierName = (potion: PotionData, tier: number): string =>
  potion.tiers.length === 1
    ? potion.name
    : `${['', 'Enhanced ', 'Superior '][tier - 1] ?? ''}${potion.name}`;

export const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return 'instant';
  if (seconds < 120) return `${seconds} s`;
  return `${Math.round(seconds / 60)} min`;
};

export const treeColour = (tree: TreeName): string => `var(--tree-${tree.toLowerCase()})`;

export const mutationColour = (mutation: Mutation): string =>
  `var(--mut-${mutation.trees.join('-').toLowerCase()})`;

export const mutagenColour = (mutagen: Mutagen): string =>
  `var(--mut-${mutagen.tree.toLowerCase()})`;

// A mutation's colours, its research cost and what has to be researched before it.
export const mutationMetaText = (mutation: Mutation, catalog: Catalog): string => {
  const requires = mutation.requires.map((id) => catalog.mutation(id)?.name ?? id).join(' and ');
  const cost = `${mutation.trees.join(' / ')} mutation · Research cost: ${mutation.cost}`;
  return requires === '' ? cost : `${cost} · Requires: ${requires}`;
};

// The board does not number its slots, so a group is named after its corner.
export const GROUP_NAMES = ['Top left', 'Top right', 'Bottom left', 'Bottom right'];

// The diamonds show the name without the word "Mutagen", the info panel and the summary show it whole.
export const mutagenLabel = (mutagen: Mutagen): string => mutagen.name.replace(/ Mutagen$/, '');

export const mutagenEffect = (mutagen: Mutagen, value: number): string =>
  `${mutagen.effect} +${value}${mutagen.unit}`;

export const GEAR_SLOT_NAMES: Readonly<Record<GearSlot, string>> = {
  steel: 'Steel sword',
  silver: 'Silver sword',
  armor: 'Armor',
  gloves: 'Gauntlets',
  trousers: 'Trousers',
  boots: 'Boots',
};

// As the game lists an item's bonus: +22% Attack Power.
export const statBonusText = ([stat, value, unit]: StatBonus): string => `+${value}${unit} ${stat}`;

// The damage of a sword or the armor of a piece of armor, as the number alone.
export const gearValue = (item: GearItemData): string =>
  item.damage === null ? `${item.armor ?? 0}` : `${item.damage[0]}-${item.damage[1]}`;

const gearUnit = (item: GearItemData): string => (item.damage === null ? 'armor' : 'damage');

export const gearStatText = (item: GearItemData): string => `${gearValue(item)} ${gearUnit(item)}`;

// The two lines under the school's name on its tile: the number alone, then what it is, with the weight
// class for armor: 335-409 above damage, 240 above Heavy armor.
export const gearTileLines = (
  item: GearItemData,
  weight: SetBonusData['weight'],
): readonly [string, string] => [
  gearValue(item),
  item.damage === null ? `${weight} ${gearUnit(item)}` : gearUnit(item),
];

// What an item is, the way the game names it: Medium armor, or the kind of sword.
export const gearKindText = (item: GearItemData, weight: SetBonusData['weight']): string =>
  item.damage === null ? `${weight} armor` : GEAR_SLOT_NAMES[item.slot];
