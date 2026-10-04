import type { Catalog, Mutagen, Mutation } from '../catalog/catalog';
import type { PotionData } from '../data/alchemy';

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

// A mutation's colours, its research cost and what has to be researched before it.
export const mutationMetaText = (mutation: Mutation, catalog: Catalog): string => {
  const requires = mutation.requires.map((id) => catalog.mutation(id).name).join(' and ');
  const cost = `${mutation.trees.join(' / ')} mutation · Research cost: ${mutation.cost}`;
  return requires === '' ? cost : `${cost} · Requires: ${requires}`;
};

// The board does not number its slots, so a group is named after its corner.
export const GROUP_NAMES = ['Top left', 'Top right', 'Bottom left', 'Bottom right'];

// The diamonds show the name without the word "Mutagen", the info panel and the summary show it whole.
export const mutagenLabel = (mutagen: Mutagen): string => mutagen.name.replace(/ Mutagen$/, '');

export const mutagenEffect = (mutagen: Mutagen, value: number): string =>
  `${mutagen.effect} +${value}${mutagen.unit}`;
