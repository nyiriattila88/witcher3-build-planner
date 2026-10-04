import type { Catalog } from '../catalog/catalog';
import {
  isSword,
  type GearItemData,
  type GearSchool,
  type GearSlot,
  type StatBonus,
} from '../data/gear';
import { ENCHANTMENT_SOCKETS, type EnchantmentData, type UpgradeData } from '../data/upgrades';

const SWORD_SLOTS: readonly GearSlot[] = ['steel', 'silver'];
const ARMOR_SLOTS: readonly GearSlot[] = ['armor', 'gloves', 'trousers', 'boots'];
// Pieces of one school that bring its first and its second set bonus.
export const SET_PIECES = { first: 3, full: 6 } as const;

// A sword takes runes and a runeword, an armor piece glyphs, and only the chest armor a glyphword.
export const upgradeKind = (slot: GearSlot): UpgradeData['kind'] =>
  SWORD_SLOTS.includes(slot) ? 'rune' : 'glyph';

export const enchantmentKind = (slot: GearSlot): EnchantmentData['kind'] | null =>
  SWORD_SLOTS.includes(slot) ? 'runeword' : slot === 'armor' ? 'glyphword' : null;

export const holdsEnchantment = (item: GearItemData, enchantment: EnchantmentData): boolean =>
  item.sockets >= ENCHANTMENT_SOCKETS && enchantment.kind === enchantmentKind(item.slot);

// The witcher gear worn, one item per slot, with the runes, glyphs or enchantment planned for each slot.
export class GearLoadout {
  readonly #catalog: Catalog;
  #items = new Map<GearSlot, GearItemData>();
  #upgrades = new Map<GearSlot, (UpgradeData | null)[]>();
  #enchantments = new Map<GearSlot, EnchantmentData>();

  constructor(catalog: Catalog) {
    this.#catalog = catalog;
  }

  clone(): GearLoadout {
    const copy = new GearLoadout(this.#catalog);
    copy.#items = new Map(this.#items);
    copy.#upgrades = new Map([...this.#upgrades].map(([slot, held]) => [slot, [...held]]));
    copy.#enchantments = new Map(this.#enchantments);
    return copy;
  }

  // Runes and enchantments need an item, so the items alone tell.
  isEmpty(): boolean {
    return this.#items.size === 0;
  }

  itemAt(slot: GearSlot): GearItemData | null {
    return this.#items.get(slot) ?? null;
  }

  get count(): number {
    return this.#items.size;
  }

  // The runes, glyphs and enchantment planned for a slot stay when another item takes it. What the item
  // has no socket for waits, inactive, for an item with room for it. An empty slot keeps nothing.
  equip(slot: GearSlot, item: GearItemData | null): void {
    if (this.itemAt(slot) === item || (item !== null && item.slot !== slot)) return;
    if (item !== null) {
      this.#items.set(slot, item);
      return;
    }
    this.#items.delete(slot);
    this.#upgrades.delete(slot);
    this.#enchantments.delete(slot);
  }

  // What is planned for the socket, whether or not the item worn has it.
  upgradeAt(slot: GearSlot, socket: number): UpgradeData | null {
    return this.#upgrades.get(slot)?.[socket] ?? null;
  }

  isSocketOpen(slot: GearSlot, socket: number): boolean {
    return socket >= 0 && socket < (this.itemAt(slot)?.sockets ?? 0);
  }

  canUpgrade(slot: GearSlot, socket: number, upgrade: UpgradeData): boolean {
    return this.isSocketOpen(slot, socket) && upgrade.kind === upgradeKind(slot);
  }

  // A rune or glyph takes the place of the enchantment, which would fill its socket.
  setUpgrade(slot: GearSlot, socket: number, upgrade: UpgradeData | null): void {
    if (!this.isSocketOpen(slot, socket)) return;
    if (upgrade !== null && !this.canUpgrade(slot, socket, upgrade)) return;
    const planned = this.#upgrades.get(slot) ?? [];
    const length = Math.max(planned.length, socket + 1);
    const held = Array.from({ length }, (_, each) =>
      each === socket ? upgrade : (planned[each] ?? null),
    );
    this.#upgrades.set(slot, held);
    if (upgrade !== null) this.#enchantments.delete(slot);
  }

  // What is planned for the slot, whether or not the item worn has room for it.
  enchantmentAt(slot: GearSlot): EnchantmentData | null {
    return this.#enchantments.get(slot) ?? null;
  }

  canEnchant(slot: GearSlot, enchantment: EnchantmentData): boolean {
    const item = this.itemAt(slot);
    return item !== null && holdsEnchantment(item, enchantment);
  }

  isEnchantmentActive(slot: GearSlot): boolean {
    const enchantment = this.enchantmentAt(slot);
    return enchantment !== null && this.canEnchant(slot, enchantment);
  }

  // An enchantment fills every socket, so it takes the place of the runes or glyphs planned for them.
  enchant(slot: GearSlot, enchantment: EnchantmentData | null): void {
    if (this.enchantmentAt(slot) === enchantment) return;
    if (enchantment === null) {
      this.#enchantments.delete(slot);
      return;
    }
    if (!this.canEnchant(slot, enchantment)) return;
    this.#enchantments.set(slot, enchantment);
    this.#upgrades.delete(slot);
  }

  reset(): void {
    this.#items.clear();
    this.#upgrades.clear();
    this.#enchantments.clear();
  }

  // Only the final version of a school's item counts towards its set bonuses.
  setPieces(school: GearSchool): number {
    return [...this.#items.values()].filter(
      (item) => item.school === school && this.#catalog.versions(item).at(-1) === item,
    ).length;
  }

  armorValue(): number {
    return [...this.#items.values()].reduce(
      (sum, item) => sum + (isSword(item) ? 0 : item.armor),
      0,
    );
  }

  // The Manticore pieces among the armor worn, or null while no armor is worn at all.
  manticoreArmorPieces(): number | null {
    const armor = ARMOR_SLOTS.flatMap((slot) => this.#items.get(slot) ?? []);
    return armor.length > 0 ? armor.filter((item) => item.school === 'Manticore').length : null;
  }

  // What the worn items and the runes and glyphs in their sockets add, one entry per stat.
  bonuses(): readonly StatBonus[] {
    const items = [...this.#items.values()].flatMap((item) => item.bonuses);
    const upgrades = [...this.#upgrades].flatMap(([slot, held]) =>
      held.flatMap((upgrade, socket) =>
        upgrade !== null && this.isSocketOpen(slot, socket) ? [upgrade.bonus] : [],
      ),
    );
    const totals = new Map<string, StatBonus>();
    for (const [stat, value, unit] of [...items, ...upgrades]) {
      const key = `${stat.toLowerCase()}|${unit}`;
      totals.set(key, [stat, (totals.get(key)?.[1] ?? 0) + value, unit]);
    }
    return [...totals.values()];
  }
}
