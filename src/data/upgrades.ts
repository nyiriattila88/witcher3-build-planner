// Runestones, glyphs and the Runewright's enchantments from Hearts of Stone, from The Witcher Wiki. Build
// codes address them by their position in these lists: append new ones, never reorder them.

import type { StatBonus } from './gear';

export type UpgradeData = {
  readonly name: string;
  // A rune goes into a sword, a glyph into an armor piece.
  readonly kind: 'rune' | 'glyph';
  readonly bonus: StatBonus;
};

// A runeword enchants a sword and a glyphword a chest armor. Either takes all of its at least 3 sockets.
export type EnchantmentData = {
  readonly name: string;
  readonly kind: 'runeword' | 'glyphword';
  // The Runewright's level that offers it.
  readonly level: number;
  readonly effect: string;
  readonly ingredients: readonly string[];
};

export const ENCHANTMENT_SOCKETS = 3;

export const UPGRADES: readonly UpgradeData[] = [
  { name: 'Lesser Chernobog runestone', kind: 'rune', bonus: ['Attack Power', 2, '%'] },
  { name: 'Chernobog runestone', kind: 'rune', bonus: ['Attack Power', 3, '%'] },
  { name: 'Greater Chernobog runestone', kind: 'rune', bonus: ['Attack Power', 5, '%'] },
  { name: 'Lesser Dazhbog runestone', kind: 'rune', bonus: ['Chance to cause burning', 2, '%'] },
  { name: 'Dazhbog runestone', kind: 'rune', bonus: ['Chance to cause burning', 3, '%'] },
  { name: 'Greater Dazhbog runestone', kind: 'rune', bonus: ['Chance to cause burning', 5, '%'] },
  { name: 'Lesser Devana runestone', kind: 'rune', bonus: ['Chance to cause bleeding', 2, '%'] },
  { name: 'Devana runestone', kind: 'rune', bonus: ['Chance to cause bleeding', 3, '%'] },
  { name: 'Greater Devana runestone', kind: 'rune', bonus: ['Chance to cause bleeding', 5, '%'] },
  { name: 'Lesser Morana runestone', kind: 'rune', bonus: ['Chance to poison', 2, '%'] },
  { name: 'Morana runestone', kind: 'rune', bonus: ['Chance to poison', 3, '%'] },
  { name: 'Greater Morana runestone', kind: 'rune', bonus: ['Chance to poison', 5, '%'] },
  { name: 'Lesser Perun runestone', kind: 'rune', bonus: ['Adrenaline Point gain', 2, '%'] },
  { name: 'Perun runestone', kind: 'rune', bonus: ['Adrenaline Point gain', 3, '%'] },
  { name: 'Greater Perun runestone', kind: 'rune', bonus: ['Adrenaline Point gain', 5, '%'] },
  { name: 'Lesser Stribog runestone', kind: 'rune', bonus: ['Chance to stagger', 2, '%'] },
  { name: 'Stribog runestone', kind: 'rune', bonus: ['Chance to stagger', 3, '%'] },
  { name: 'Greater Stribog runestone', kind: 'rune', bonus: ['Chance to stagger', 5, '%'] },
  { name: 'Lesser Svarog runestone', kind: 'rune', bonus: ['Armor piercing', 10, ''] },
  { name: 'Svarog runestone', kind: 'rune', bonus: ['Armor piercing', 20, ''] },
  { name: 'Greater Svarog runestone', kind: 'rune', bonus: ['Armor piercing', 30, ''] },
  { name: 'Lesser Triglav runestone', kind: 'rune', bonus: ['Chance to stun', 2, '%'] },
  { name: 'Triglav runestone', kind: 'rune', bonus: ['Chance to stun', 3, '%'] },
  { name: 'Greater Triglav runestone', kind: 'rune', bonus: ['Chance to stun', 5, '%'] },
  { name: 'Lesser Veles runestone', kind: 'rune', bonus: ['Sign intensity', 2, '%'] },
  { name: 'Veles runestone', kind: 'rune', bonus: ['Sign intensity', 3, '%'] },
  { name: 'Greater Veles runestone', kind: 'rune', bonus: ['Sign intensity', 5, '%'] },
  { name: 'Lesser Zoria runestone', kind: 'rune', bonus: ['Chance to freeze', 2, '%'] },
  { name: 'Zoria runestone', kind: 'rune', bonus: ['Chance to freeze', 3, '%'] },
  { name: 'Greater Zoria runestone', kind: 'rune', bonus: ['Chance to freeze', 5, '%'] },
  { name: 'Lesser Glyph of Aard', kind: 'glyph', bonus: ['Aard Sign intensity', 2, '%'] },
  { name: 'Glyph of Aard', kind: 'glyph', bonus: ['Aard Sign intensity', 5, '%'] },
  { name: 'Greater Glyph of Aard', kind: 'glyph', bonus: ['Aard Sign intensity', 10, '%'] },
  { name: 'Lesser Glyph of Axii', kind: 'glyph', bonus: ['Axii Sign intensity', 2, '%'] },
  { name: 'Glyph of Axii', kind: 'glyph', bonus: ['Axii Sign intensity', 5, '%'] },
  { name: 'Greater Glyph of Axii', kind: 'glyph', bonus: ['Axii Sign intensity', 10, '%'] },
  { name: 'Lesser Glyph of Binding', kind: 'glyph', bonus: ['Resistance to bleeding', 2, '%'] },
  { name: 'Glyph of Binding', kind: 'glyph', bonus: ['Resistance to bleeding', 3, '%'] },
  { name: 'Greater Glyph of Binding', kind: 'glyph', bonus: ['Resistance to bleeding', 5, '%'] },
  { name: 'Lesser Glyph of Igni', kind: 'glyph', bonus: ['Igni Sign intensity', 2, '%'] },
  { name: 'Glyph of Igni', kind: 'glyph', bonus: ['Igni Sign intensity', 5, '%'] },
  { name: 'Greater Glyph of Igni', kind: 'glyph', bonus: ['Igni Sign intensity', 10, '%'] },
  { name: 'Lesser Glyph of Mending', kind: 'glyph', bonus: ['Vitality regeneration', 1, ''] },
  { name: 'Glyph of Mending', kind: 'glyph', bonus: ['Vitality regeneration', 2, ''] },
  { name: 'Greater Glyph of Mending', kind: 'glyph', bonus: ['Vitality regeneration', 3, ''] },
  { name: 'Lesser Glyph of Quen', kind: 'glyph', bonus: ['Quen Sign intensity', 2, '%'] },
  { name: 'Glyph of Quen', kind: 'glyph', bonus: ['Quen Sign intensity', 5, '%'] },
  { name: 'Greater Glyph of Quen', kind: 'glyph', bonus: ['Quen Sign intensity', 10, '%'] },
  {
    name: 'Lesser Glyph of Reinforcement',
    kind: 'glyph',
    bonus: ['Reduction in item durability loss', 33, '%'],
  },
  {
    name: 'Glyph of Reinforcement',
    kind: 'glyph',
    bonus: ['Reduction in item durability loss', 50, '%'],
  },
  {
    name: 'Greater Glyph of Reinforcement',
    kind: 'glyph',
    bonus: ['Reduction in item durability loss', 100, '%'],
  },
  {
    name: 'Lesser Glyph of Warding',
    kind: 'glyph',
    bonus: ['Resistance to elemental damage', 1, '%'],
  },
  { name: 'Glyph of Warding', kind: 'glyph', bonus: ['Resistance to elemental damage', 2, '%'] },
  {
    name: 'Greater Glyph of Warding',
    kind: 'glyph',
    bonus: ['Resistance to elemental damage', 3, '%'],
  },
  { name: 'Lesser Glyph of Yrden', kind: 'glyph', bonus: ['Yrden Sign intensity', 2, '%'] },
  { name: 'Glyph of Yrden', kind: 'glyph', bonus: ['Yrden Sign intensity', 5, '%'] },
  { name: 'Greater Glyph of Yrden', kind: 'glyph', bonus: ['Yrden Sign intensity', 10, '%'] },
];

export const ENCHANTMENTS: readonly EnchantmentData[] = [
  {
    name: 'Balance',
    kind: 'glyphword',
    level: 2,
    effect: 'All equipped armor items are treated as Medium Armor.',
    ingredients: ['Glyph of Axii', 'Glyph of Mending', 'Glyph of Reinforcement'],
  },
  {
    name: 'Beguilement',
    kind: 'glyphword',
    level: 2,
    effect: 'Enemies affected by Axii will be affected for 2s longer for each blow they land.',
    ingredients: ['Glyph of Axii', 'Glyph of Igni', 'Glyph of Mending'],
  },
  {
    name: 'Deflection',
    kind: 'glyphword',
    level: 1,
    effect: 'Armor deflects all arrows.',
    ingredients: [
      'Lesser Glyph of Aard',
      'Lesser Glyph of Warding',
      'Lesser Glyph of Reinforcement',
    ],
  },
  {
    name: 'Depletion',
    kind: 'glyphword',
    level: 1,
    effect: 'Hitting enemies with Aard reduces their Stamina by 100%.',
    ingredients: ['Lesser Glyph of Aard', 'Lesser Glyph of Axii', 'Lesser Glyph of Reinforcement'],
  },
  {
    name: 'Entanglement',
    kind: 'glyphword',
    level: 2,
    effect: 'When a trap set by Yrden hits an enemy, an Yrden glyph is placed at that position.',
    ingredients: ['Glyph of Yrden', 'Glyph of Axii', 'Glyph of Binding'],
  },
  {
    name: 'Eruption',
    kind: 'glyphword',
    level: 3,
    effect: 'Enemies set alight by Igni explode when they die and ignite nearby foes.',
    ingredients: [
      'Greater Glyph of Igni',
      'Greater Glyph of Quen',
      'Greater Glyph of Reinforcement',
    ],
  },
  {
    name: 'Heft',
    kind: 'glyphword',
    level: 1,
    effect: 'All equipped armor items are treated as Heavy Armor.',
    ingredients: [
      'Lesser Glyph of Quen',
      'Lesser Glyph of Mending',
      'Lesser Glyph of Reinforcement',
    ],
  },
  {
    name: 'Ignition',
    kind: 'glyphword',
    level: 1,
    effect:
      'Enemies set alight with Igni have a 100% chance to ignite other enemies within a 2 yard radius.',
    ingredients: ['Lesser Glyph of Igni', 'Lesser Glyph of Yrden', 'Lesser Glyph of Warding'],
  },
  {
    name: 'Levity',
    kind: 'glyphword',
    level: 3,
    effect: 'All equipped armor items are treated as Light Armor.',
    ingredients: [
      'Greater Glyph of Aard',
      'Greater Glyph of Mending',
      'Greater Glyph of Reinforcement',
    ],
  },
  {
    name: 'Possession',
    kind: 'glyphword',
    level: 3,
    effect:
      "When an opponent influenced by Axii dies, the effect transfers to a nearby target. The effect's duration increases by 2 seconds for each blow the affected target lands.",
    ingredients: ['Greater Glyph of Axii', 'Greater Glyph of Aard', 'Greater Glyph of Binding'],
  },
  {
    name: 'Protection',
    kind: 'glyphword',
    level: 2,
    effect:
      "When you enter combat, there's a 100 percent chance you will automatically get a Quen shield without using any Stamina.",
    ingredients: ['Glyph of Quen', 'Glyph of Yrden', 'Glyph of Warding'],
  },
  {
    name: 'Retribution',
    kind: 'glyphword',
    level: 3,
    effect: 'Gives a 30% chance of returning a portion of damage received to the attacker.',
    ingredients: [
      'Greater Glyph of Quen',
      'Greater Glyph of Igni',
      'Greater Glyph of Reinforcement',
    ],
  },
  {
    name: 'Rotation',
    kind: 'glyphword',
    level: 2,
    effect: "Igni's basic attack strikes all opponents in a 360-degree radius.",
    ingredients: ['Glyph of Igni', 'Glyph of Binding', 'Glyph of Reinforcement'],
  },
  {
    name: 'Usurpation',
    kind: 'glyphword',
    level: 1,
    effect: 'When an enemy affected by Axii dies, the effect transfers to the nearest target.',
    ingredients: [
      'Lesser Glyph of Axii',
      'Lesser Glyph of Binding',
      'Lesser Glyph of Reinforcement',
    ],
  },
  {
    name: 'Dumplings',
    kind: 'runeword',
    level: 1,
    effect:
      'Any food consumed regenerates 400% more Vitality, but everything tastes like pierogies.',
    ingredients: ['Pyerog runestone', 'Tvarog runestone'],
  },
  {
    name: 'Elation',
    kind: 'runeword',
    level: 2,
    effect: 'Fatal blows dealt with your sword give 0.1 to 0.25 Adrenaline Points.',
    ingredients: ['Dazhbog runestone', 'Veles runestone', 'Devana runestone'],
  },
  {
    name: 'Invigoration',
    kind: 'runeword',
    level: 3,
    effect:
      'When at maximum Vitality, any Vitality regeneration turns into added damage (up to +50%) on your next strike.',
    ingredients: ['Greater Devana runestone', 'Greater Zoria runestone', 'Greater Perun runestone'],
  },
  {
    name: 'Placation',
    kind: 'runeword',
    level: 1,
    effect:
      'Once they reach their maximum level, Adrenaline Points steadily decline until they reach 0. During this time Vitality and Stamina regeneration are accelerated and Toxicity declines more quickly.',
    ingredients: ['Lesser Devana runestone', 'Lesser Morana runestone', 'Lesser Stribog runestone'],
  },
  {
    name: 'Preservation',
    kind: 'runeword',
    level: 1,
    effect: "Armorer's Table and Grindstone bonuses never expire.",
    ingredients: ['Lesser Svarog runestone', 'Lesser Devana runestone', 'Lesser Morana runestone'],
  },
  {
    name: 'Prolongation',
    kind: 'runeword',
    level: 3,
    effect: 'Each unblocked blow increases potion duration time by 0.5s.',
    ingredients: [
      'Greater Morana runestone',
      'Greater Perun runestone',
      'Greater Svarog runestone',
    ],
  },
  {
    name: 'Rejuvenation',
    kind: 'runeword',
    level: 2,
    effect: 'Each fatal blow dealt restores 25% of your Stamina.',
    ingredients: ['Perun runestone', 'Svarog runestone', 'Stribog runestone'],
  },
  {
    name: 'Replenishment',
    kind: 'runeword',
    level: 3,
    effect:
      'After you cast a Sign, an Adrenaline Point is consumed and your next sword attack is charged with the power of that Sign.',
    ingredients: [
      'Greater Triglav runestone',
      'Greater Morana runestone',
      'Greater Dazhbog runestone',
    ],
  },
  {
    name: 'Severance',
    kind: 'runeword',
    level: 2,
    effect: 'Increases the range of Whirl by 1.1 yards and Rend by 1.9 yards.',
    ingredients: ['Zoria runestone', 'Veles runestone', 'Perun runestone'],
  },
];
