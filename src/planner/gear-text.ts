import {
  isSword,
  type GearItemData,
  type GearSlot,
  type SetBonusData,
  type StatBonus,
} from '../data/gear';
import type { EnchantmentData } from '../data/upgrades';

export const ENCHANTMENT_NAMES: Readonly<Record<EnchantmentData['kind'], string>> = {
  runeword: 'Runeword',
  glyphword: 'Glyphword',
};

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
  isSword(item) ? `${item.damage[0]}-${item.damage[1]}` : `${item.armor}`;

const gearUnit = (item: GearItemData): string => (isSword(item) ? 'damage' : 'armor');

export const gearStatText = (item: GearItemData): string => `${gearValue(item)} ${gearUnit(item)}`;

// The two lines under the school's name on its tile: the number alone, then what it is, with the weight
// class for armor: 335-409 above damage, 240 above Heavy armor.
export const gearTileLines = (
  item: GearItemData,
  weight: SetBonusData['weight'],
): readonly [string, string] => [
  gearValue(item),
  isSword(item) ? gearUnit(item) : `${weight} ${gearUnit(item)}`,
];

// What an item is, the way the game names it: Medium armor, or the kind of sword.
export const gearKindText = (item: GearItemData, weight: SetBonusData['weight']): string =>
  isSword(item) ? GEAR_SLOT_NAMES[item.slot] : `${weight} armor`;
