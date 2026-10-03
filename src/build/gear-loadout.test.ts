import { describe, expect, it } from 'vitest';
import { createGameCatalog } from '../catalog/game-catalog';
import type { GearItemData } from '../data/gear';
import type { EnchantmentData, UpgradeData } from '../data/upgrades';
import { GearLoadout } from './gear-loadout';

const catalog = createGameCatalog();

const gear = (name: string): GearItemData => {
  const found = catalog.gear.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names unknown gear: ${name}`);
  return found;
};

const upgrade = (name: string): UpgradeData => {
  const found = catalog.upgrades.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names an unknown rune or glyph: ${name}`);
  return found;
};

const enchantment = (name: string): EnchantmentData => {
  const found = catalog.enchantments.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names an unknown enchantment: ${name}`);
  return found;
};

describe('GearLoadout', () => {
  it('keeps the runes of a slot when another item takes it, with the one it has no socket for idle', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('steel', gear('Grandmaster Feline steel sword'));
    for (const socket of [0, 1, 2]) {
      loadout.setUpgrade('steel', socket, upgrade('Greater Chernobog runestone'));
    }

    loadout.equip('steel', gear('Enhanced Ursine steel sword'));

    expect([0, 1, 2].map((socket) => loadout.upgradeAt('steel', socket)?.name)).toEqual(
      Array<string>(3).fill('Greater Chernobog runestone'),
    );
    expect([0, 1, 2].map((socket) => loadout.isSocketOpen('steel', socket))).toEqual([
      true,
      true,
      false,
    ]);
    expect(loadout.bonuses().find(([stat]) => stat === 'Attack Power')?.[1]).toBe(5 + 5);
  });

  it('brings an idle enchantment back once an item holds it again', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('steel', gear('Grandmaster Feline steel sword'));
    loadout.enchant('steel', enchantment('Replenishment'));

    loadout.equip('steel', gear('Enhanced Feline steel sword'));
    const onTwoSockets = loadout.isEnchantmentActive('steel');
    loadout.equip('steel', gear('Grandmaster Ursine steel sword'));

    expect([onTwoSockets, loadout.isEnchantmentActive('steel')]).toEqual([false, true]);
  });

  it('forgets the runes and enchantment of a slot that is emptied', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('steel', gear('Grandmaster Feline steel sword'));
    loadout.setUpgrade('steel', 0, upgrade('Greater Chernobog runestone'));

    loadout.equip('steel', null);
    loadout.equip('steel', gear('Grandmaster Feline steel sword'));

    expect(loadout.upgradeAt('steel', 0)).toBeNull();
  });

  it('counts only the final version of an item towards the set bonuses', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('armor', gear('Mastercrafted Feline armor'));
    loadout.equip('gloves', gear('Grandmaster Feline gauntlets'));

    expect(loadout.setPieces('Cat')).toBe(1);
  });

  it('puts a rune only into a sword and a glyph only into an armor piece', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('steel', gear('Grandmaster Feline steel sword'));
    loadout.equip('boots', gear('Grandmaster Feline boots'));

    loadout.setUpgrade('steel', 0, upgrade('Greater Glyph of Quen'));
    loadout.setUpgrade('boots', 0, upgrade('Greater Chernobog runestone'));
    loadout.setUpgrade('boots', 1, upgrade('Greater Glyph of Quen'));

    expect([
      loadout.upgradeAt('steel', 0),
      loadout.upgradeAt('boots', 0),
      loadout.upgradeAt('boots', 1)?.name,
    ]).toEqual([null, null, 'Greater Glyph of Quen']);
  });

  it('enchants a sword or chest armor with three sockets, and the enchantment fills them', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('armor', gear('Grandmaster Griffin armor'));
    loadout.equip('boots', gear('Grandmaster Griffin boots'));
    loadout.setUpgrade('armor', 0, upgrade('Greater Glyph of Quen'));

    loadout.enchant('armor', enchantment('Eruption'));
    loadout.enchant('boots', enchantment('Eruption'));

    expect([
      loadout.enchantmentAt('armor')?.name,
      loadout.enchantmentAt('boots'),
      loadout.upgradeAt('armor', 0),
    ]).toEqual(['Eruption', null, null]);
  });

  it('lets a glyph take the place of the enchantment again', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('armor', gear('Grandmaster Griffin armor'));
    loadout.enchant('armor', enchantment('Eruption'));

    loadout.setUpgrade('armor', 1, upgrade('Greater Glyph of Igni'));

    expect([loadout.enchantmentAt('armor'), loadout.upgradeAt('armor', 1)?.name]).toEqual([
      null,
      'Greater Glyph of Igni',
    ]);
  });

  it('counts every piece of a school towards its set bonuses', () => {
    const loadout = new GearLoadout(catalog);
    for (const name of ['steel sword', 'silver sword', 'armor', 'gauntlets']) {
      loadout.equip(gear(`Grandmaster Feline ${name}`).slot, gear(`Grandmaster Feline ${name}`));
    }
    loadout.equip('boots', gear('Viper boots'));

    expect([loadout.setPieces('Cat'), loadout.setPieces('Viper')]).toEqual([4, 1]);
  });

  it('adds up the bonuses of the worn items and their runes per stat', () => {
    const loadout = new GearLoadout(catalog);
    loadout.equip('armor', gear('Grandmaster Feline armor'));
    loadout.equip('gloves', gear('Grandmaster Feline gauntlets'));
    loadout.equip('steel', gear('Grandmaster Feline steel sword'));
    loadout.setUpgrade('steel', 0, upgrade('Greater Chernobog runestone'));

    const attackPower = loadout.bonuses().find(([stat]) => stat === 'Attack Power');

    expect(attackPower).toEqual(['Attack Power', 22 + 11 + 5, '%']);
  });
});
