import { describe, expect, it } from 'vitest';
import type { Skill } from '../catalog/catalog';
import { createGameCatalog } from '../catalog/game-catalog';
import type { TreeName } from '../data/skills';
import { Build } from './build';
import { parseSnapshot, type BuildSnapshot } from './build-snapshot';

const catalog = createGameCatalog();

const skill = (tree: TreeName, name: string): Skill => {
  const found = catalog.skill(tree, name);
  if (found === undefined) throw new Error(`Test data names an unknown skill: ${tree}/${name}`);
  return found;
};

const withPoints = (...skills: Skill[]): Build => {
  const build = new Build(catalog);
  for (const each of skills) build.addPoint(each);
  return build;
};

const aSnapshot = (overrides: Partial<BuildSnapshot> = {}): BuildSnapshot => ({
  points: {},
  slots: [],
  mutagens: [],
  researched: [],
  mutation: null,
  ...overrides,
});

describe('Build skill points', () => {
  it('refuses a point for a skill whose prerequisites have none', () => {
    const build = new Build(catalog);

    build.addPoint(skill('Combat', 'Strength Training'));

    expect(build.rank(skill('Combat', 'Strength Training'))).toBe(0);
  });

  it('keeps the last point of a skill another learned skill depends on', () => {
    const build = withPoints(skill('Combat', 'Muscle Memory'), skill('Combat', 'Three Strikes'));

    build.removePoint(skill('Combat', 'Muscle Memory'));

    expect(build.rank(skill('Combat', 'Muscle Memory'))).toBe(1);
  });

  it('stops at the third rank', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const build = withPoints(muscleMemory, muscleMemory, muscleMemory, muscleMemory);

    expect(build.rank(muscleMemory)).toBe(3);
  });
});

describe('Build skill slots', () => {
  it('slots only a skill that has points', () => {
    const build = new Build(catalog);

    build.placeSkill(skill('Combat', 'Muscle Memory'), 0);

    expect(build.slotAt(0)).toBeNull();
  });

  it('swaps two slotted skills when one is dragged onto the other', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const threeStrikes = skill('Combat', 'Three Strikes');
    const build = withPoints(muscleMemory, threeStrikes);
    build.placeSkill(muscleMemory, 0);
    build.placeSkill(threeStrikes, 1);

    build.placeSkill(muscleMemory, 1);

    expect([build.slotAt(0)?.name, build.slotAt(1)?.name]).toEqual([
      'Three Strikes',
      'Muscle Memory',
    ]);
  });

  it('unslots a skill whose last point is removed', () => {
    const threeStrikes = skill('Combat', 'Three Strikes');
    const build = withPoints(skill('Combat', 'Muscle Memory'), threeStrikes);
    build.placeSkill(threeStrikes, 0);

    build.removePoint(threeStrikes);

    expect(build.slotAt(0)).toBeNull();
  });
});

describe('Build mutations', () => {
  it('researches a mutation only after everything it requires', () => {
    const build = new Build(catalog);

    build.research('bloodbath');

    expect(build.isResearched('bloodbath')).toBe(false);
  });

  it('opens slot 13 at two researched mutations and slot 14 at four', () => {
    const build = new Build(catalog);
    build.research('deadly-counter');
    build.research('magic-sensibilities');

    const atTwo = [build.isSlotUnlocked(12), build.isSlotUnlocked(13)];
    build.research('bloodbath');
    build.research('piercing-cold');
    const atFour = build.isSlotUnlocked(13);

    expect(atTwo).toEqual([true, false]);
    expect(atFour).toBe(true);
  });

  it('fills the extra slots only with the slotted mutation colours', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const meltArmor = skill('Signs', 'Melt Armor');
    const build = withPoints(muscleMemory, meltArmor);
    build.research('deadly-counter');
    build.research('magic-sensibilities');
    build.slotMutation('deadly-counter');

    build.placeSkill(meltArmor, 12);
    const signsInRedSlot = build.slotAt(12);
    build.placeSkill(muscleMemory, 12);
    build.slotMutation('magic-sensibilities');

    expect(signsInRedSlot).toBeNull();
    expect(build.slotAt(12)).toBeNull();
  });

  it('keeps a mutation another researched mutation requires', () => {
    const build = new Build(catalog);
    build.research('deadly-counter');
    build.research('bloodbath');

    build.unresearch('deadly-counter');

    expect(build.isResearched('deadly-counter')).toBe(true);
  });
});

describe('Build mutagens', () => {
  it('adds the base bonus once more per matching skill and 10% per Synergy rank', () => {
    const snapshot = aSnapshot({
      points: {
        General: {
          'Cat School Techniques': 1,
          'Adrenaline Burst': 1,
          'Survival Instinct': 1,
          'Anger Management': 1,
          Synergy: 3,
        },
        Alchemy: { Efficiency: 1 },
      },
      slots: [
        { tree: 'Alchemy', name: 'Efficiency' },
        null,
        null,
        { tree: 'General', name: 'Synergy' },
      ],
      mutagens: ['greater-green'],
    });

    const bonus = Build.fromSnapshot(catalog, snapshot).mutagenBonus(0);

    expect(bonus).toMatchObject({ matching: 1, synergy: 3, value: Math.floor(150 * 2 * 1.3) });
  });
});

describe('Build snapshots', () => {
  it('ignores unknown names and anything against the rules', () => {
    const stored = parseSnapshot({
      points: { Combat: { 'Flood of Anger': 3, Nope: 2 } },
      researched: ['second-life', 'not-a-mutation'],
      mutation: 'second-life',
      slots: [{ tree: 'Combat', name: 'Flood of Anger' }],
      mutagens: ['bogus'],
    });

    const build = Build.fromSnapshot(catalog, stored ?? aSnapshot());

    expect(build.totalPoints()).toBe(0);
    expect(build.slotAt(0)).toBeNull();
    expect(build.mutagenAt(0)).toBeNull();
    expect(build.slottedMutation).toBeNull();
  });

  it('reads back what it wrote', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const build = withPoints(muscleMemory, muscleMemory);
    build.placeSkill(muscleMemory, 4);

    const copy = Build.fromSnapshot(catalog, build.toSnapshot());

    expect(copy.toSnapshot()).toEqual(build.toSnapshot());
  });

  it('leaves the original untouched when a clone changes', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const original = withPoints(muscleMemory);

    const clone = original.clone();
    clone.addPoint(muscleMemory);

    expect([original.rank(muscleMemory), clone.rank(muscleMemory)]).toEqual([1, 2]);
  });
});
