import { describe, expect, it } from 'vitest';
import { createGameCatalog } from '../catalog/game-catalog';
import { GEAR_SLOTS } from '../data/gear';
import { Build, MUTAGEN_GROUPS } from './build';
import { createBuildCodec } from './build-code';

const catalog = createGameCatalog();
const codec = createBuildCodec(catalog);

// Codes made by the 1.x planner. They must keep opening the same build.
const COMBAT_SIGNS_CODE = 'W3R1.yAEABAAgBAAAAAAAAAAAAAEAACAABAbAAAAAAAIAAAAAAAAAABOADAAAAAADAAHBrG';
const ALCHEMY_GENERAL_CODE =
  'W3R1.AAAAAAAAAAAAADAsIAAAAQAAAMAAvAqAyBNBAAAAuAAAAAAAAAAAAAAAAAAJCHAAAA';

const decodeBuild = (code: string): Build => {
  const build = codec.decode(code);
  if (build === null) throw new Error(`Test code does not decode: ${code}`);
  return build;
};

// Everything a build holds, in a form that two equal builds share regardless of how they were made.
const fingerprint = (build: Build): string =>
  JSON.stringify({
    ranks: catalog.skills.map((skill) => build.rank(skill)),
    slots: Array.from({ length: build.slotCount }, (_, i) => build.slotAt(i)?.index ?? null),
    mutagens: Array.from({ length: MUTAGEN_GROUPS }, (_, group) => build.mutagenAt(group)),
    researched: catalog.mutations.map((mutation) => build.isResearched(mutation.id)),
    mutation: build.slottedMutation,
    potions: catalog.potions.map((potion) => build.potionTier(potion)),
    decoctions: catalog.decoctions.map((decoction) => build.isDecoctionActive(decoction)),
    manticore: build.manticorePieces,
    recipes: build.knownRecipes,
    gear: GEAR_SLOTS.map((slot) => [
      build.gearAt(slot)?.name ?? null,
      build.enchantmentAt(slot)?.name ?? null,
      [0, 1, 2].map((socket) => build.upgradeAt(slot, socket)?.name ?? null),
    ]),
  });

// A small seeded generator, so the random builds are the same on every run.
const seededRandom = (seed: number): (() => number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

const aRandomBuild = (random: () => number): Build => {
  const build = new Build(catalog);
  const pick = <T>(items: readonly T[]): T | undefined =>
    items[Math.floor(random() * items.length)];
  const pointCount = Math.floor(random() * 70);
  for (let i = 0; i < pointCount; i++) {
    const skill = pick(catalog.skills.filter((candidate) => build.canAddPoint(candidate)));
    if (skill !== undefined) build.addPoint(skill);
  }
  for (let i = 0; i < 8; i++) {
    const mutation = pick(catalog.mutations.filter((candidate) => build.canResearch(candidate.id)));
    if (mutation !== undefined && random() < 0.6) build.research(mutation.id);
  }
  const slottable = pick(
    catalog.mutations.filter((candidate) => build.canSlotMutation(candidate.id)),
  );
  if (slottable !== undefined && random() < 0.6) build.slotMutation(slottable.id);
  for (let i = 0; i < build.slotCount; i++) {
    const skill = pick(catalog.skills.filter((candidate) => build.rank(candidate) > 0));
    if (skill !== undefined && random() < 0.7) build.placeSkill(skill, i);
  }
  for (let group = 0; group < MUTAGEN_GROUPS; group++) {
    const mutagen = pick(catalog.mutagens);
    if (mutagen !== undefined && random() < 0.6) build.placeMutagen(mutagen.id, group);
  }
  for (const potion of catalog.potions) {
    if (random() < 0.3) build.setPotionTier(potion, 1 + Math.floor(random() * potion.tiers.length));
  }
  for (const decoction of catalog.decoctions) {
    if (random() < 0.15) build.setDecoctionActive(decoction, true);
  }
  if (random() < 0.5) build.setManticorePieces(Math.floor(random() * 5));
  if (random() < 0.5) build.setKnownRecipes(Math.floor(random() * 150));
  for (const slot of GEAR_SLOTS) {
    const item = pick(catalog.gear.filter((each) => each.slot === slot));
    if (item === undefined || random() < 0.4) continue;
    build.equip(slot, item);
    const word = pick(catalog.enchantments.filter((each) => build.canEnchant(slot, each)));
    if (word !== undefined && random() < 0.3) build.enchant(slot, word);
    for (let socket = 0; socket < item.sockets; socket++) {
      const upgrade = pick(catalog.upgrades.filter((each) => build.canUpgrade(slot, socket, each)));
      if (upgrade !== undefined && random() < 0.6) build.setUpgrade(slot, socket, upgrade);
    }
  }
  return build;
};

describe('createBuildCodec', () => {
  it('writes an empty build as A', () => {
    const code = codec.encode(new Build(catalog));

    expect(code).toBe('A');
  });

  it('writes the 1.x example builds as their pinned codes', () => {
    const oldCodes = [COMBAT_SIGNS_CODE, ALCHEMY_GENERAL_CODE];

    const newCodes = oldCodes.map((code) => codec.encode(decodeBuild(code)));

    expect(newCodes).toEqual(['5yx4ZhzLhrAAYAECABY7', 'OB66AAAcCDjM']);
    expect(newCodes.map((code) => fingerprint(decodeBuild(code)))).toEqual(
      oldCodes.map((code) => fingerprint(decodeBuild(code))),
    );
  });

  it('writes a build with everything filled shorter than a 1.x code', () => {
    const build = new Build(catalog);
    // Repeated passes, because a skill or mutation only opens once what it requires is in.
    for (let pass = 0; pass < 12; pass++) {
      for (const skill of catalog.skills) build.addPoint(skill);
      for (const mutation of catalog.mutations) build.research(mutation.id);
    }
    build.slotMutation('metamorphosis');
    for (let i = 0; i < build.slotCount; i++) {
      const skill = catalog.skills.find((s) => build.slotOf(s) < 0 && build.slotAccepts(i, s));
      if (skill !== undefined) build.placeSkill(skill, i);
    }
    for (let group = 0; group < MUTAGEN_GROUPS; group++) {
      const mutagen = catalog.mutagens[group];
      if (mutagen !== undefined) build.placeMutagen(mutagen.id, group);
    }

    const code = codec.encode(build);

    expect(
      Array.from({ length: build.slotCount }, (_, i) => build.slotAt(i) !== null),
    ).not.toContain(false);
    expect(code.length).toBeLessThan(COMBAT_SIGNS_CODE.length);
  });

  it('gives every build exactly one code and every code exactly one build', () => {
    const random = seededRandom(20261002);
    const builds = Array.from({ length: 300 }, () => aRandomBuild(random));

    const codes = builds.map((build) => codec.encode(build));
    const reopened = codes.map((code) => fingerprint(decodeBuild(code)));

    expect(reopened).toEqual(builds.map(fingerprint));
    expect(new Set(codes).size).toBe(new Set(builds.map(fingerprint)).size);
  });

  it('opens a 1.x combat and signs code as the same build', () => {
    const build = decodeBuild(COMBAT_SIGNS_CODE);

    const filledSlots = Array.from({ length: build.slotCount }, (_, i) => build.slotAt(i)).filter(
      (skill) => skill !== null,
    );

    expect(build.totalPoints()).toBe(27);
    expect(build.slottedMutation).toBe('adrenaline-rush');
    expect(filledSlots).toHaveLength(5);
    expect(build.slotAt(12)?.name).toBe('Three Strikes');
    expect([build.mutagenBonus(0)?.value, build.mutagenBonus(3)?.value]).toEqual([20, 50]);
  });

  it('opens a 1.x alchemy and general code with its mutagen bonuses', () => {
    const build = decodeBuild(ALCHEMY_GENERAL_CODE);

    const bonuses = [0, 1, 2].map((group) => build.mutagenBonus(group)?.value);

    expect(build.totalPoints()).toBe(14);
    expect(bonuses).toEqual([600, 7, 100]);
  });

  it('rejects a second spelling of a build', () => {
    // A leading zero digit, and a tree marked as having points without any.
    const spellings = ['AA', 'AB', 'B'];

    const decoded = spellings.map((code) => codec.decode(code));

    expect(decoded).toEqual([null, null, null]);
  });

  it('rejects text that is not a whole build code', () => {
    const inputs = ['', 'not a code', COMBAT_SIGNS_CODE.slice(0, -1), '2.', '!', 'z'.repeat(100)];

    const decoded = inputs.map((input) => codec.decode(input));

    expect(decoded).toEqual([null, null, null, null, null, null]);
  });

  it('still opens the gear codes 2.6 wrote, when only the final versions existed', () => {
    const build = decodeBuild('BEPNKUu99K6Yfk9jyAAAAAAAAAAA');

    expect(GEAR_SLOTS.map((slot) => build.gearAt(slot)?.name ?? null)).toEqual([
      'Grandmaster Feline steel sword',
      'Grandmaster Feline silver sword',
      'Grandmaster Feline armor',
      'Grandmaster Feline gauntlets',
      'Manticore trousers',
      'Manticore boots',
    ]);
    expect([build.upgradeAt('steel', 0)?.name, build.enchantmentAt('armor')?.name]).toEqual([
      'Greater Chernobog runestone',
      'Eruption',
    ]);
  });

  it('still opens the codes 2.1.0 wrote with a "2." in front', () => {
    const code = '2.OB66AAAcCDjM';

    const build = decodeBuild(code);

    expect(fingerprint(build)).toBe(fingerprint(decodeBuild(ALCHEMY_GENERAL_CODE)));
    expect(codec.encode(build)).toBe('OB66AAAcCDjM');
  });
});
