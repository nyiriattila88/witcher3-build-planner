import { describe, expect, it } from 'vitest';
import type { Skill } from '../catalog/catalog';
import { createGameCatalog } from '../catalog/game-catalog';
import type { PotionData } from '../data/alchemy';
import { ALCHEMY_RECIPES } from '../data/alchemy';
import type { GearItemData } from '../data/gear';
import type { TreeName } from '../data/skills';
import { Build } from './build';
import type { BuildSnapshot } from './build-snapshot';

const catalog = createGameCatalog();

const skill = (tree: TreeName, name: string): Skill => {
  const found = catalog.findSkill(tree, name);
  if (found === undefined) throw new Error(`Test data names an unknown skill: ${tree}/${name}`);
  return found;
};

const withPoints = (...skills: Skill[]): Build => {
  const build = new Build(catalog);
  for (const each of skills) build.addPoint(each);
  return build;
};

const potion = (name: string): PotionData => {
  const found = catalog.potions.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names an unknown potion: ${name}`);
  return found;
};

const gear = (name: string): GearItemData => {
  const found = catalog.gear.find((each) => each.name === name);
  if (found === undefined) throw new Error(`Test data names unknown gear: ${name}`);
  return found;
};

// Learns whole trees, so any of their skills can be slotted.
const withTrees = (...trees: TreeName[]): Build => {
  const build = new Build(catalog);
  for (let pass = 0; pass < 10; pass++) {
    for (const tree of trees) {
      for (const each of catalog.tree(tree).skills)
        if (build.rank(each) === 0) build.addPoint(each);
    }
  }
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

  it('takes the skills only it unlocked along with its last point', () => {
    const branch = ['Muscle Memory', 'Strength Training', 'Crushing Blow', 'Sunder Armor'];
    const build = withPoints(...branch.map((name) => skill('Combat', name)));

    build.removePoint(skill('Combat', 'Muscle Memory'));

    expect(branch.map((name) => build.rank(skill('Combat', name)))).toEqual([0, 0, 0, 0]);
  });

  it('keeps a skill that another learned parent still unlocks', () => {
    const build = withPoints(
      ...['Muscle Memory', 'Three Strikes', 'Arrow Deflection', 'Resolve', 'Undying'].map((name) =>
        skill('Combat', name),
      ),
    );

    build.removePoint(skill('Combat', 'Muscle Memory'));

    expect([
      build.rank(skill('Combat', 'Three Strikes')),
      build.rank(skill('Combat', 'Undying')),
    ]).toEqual([0, 1]);
  });

  it('opens a General skill from a learned skill linked to it below', () => {
    const build = withPoints(
      skill('General', 'Viper School Techniques'),
      skill('General', 'Advanced Pyrotechnics'),
    );

    build.addPoint(skill('General', 'Elemental Attunement'));

    expect(build.rank(skill('General', 'Elemental Attunement'))).toBe(1);
  });

  it('takes the General skills that only kept each other once their way to a School is gone', () => {
    const way = ['Cat School Techniques', 'Battle Frenzy', 'Strong Back', 'Gourmand'];
    const build = withPoints(...way.map((name) => skill('General', name)));

    build.removePoint(skill('General', 'Battle Frenzy'));

    expect(way.map((name) => build.rank(skill('General', name)))).toEqual([1, 0, 0, 0]);
  });

  it('keeps a General skill that a learned way from another School still reaches', () => {
    const build = withPoints(
      ...[
        'Cat School Techniques',
        'Battle Frenzy',
        'Strong Back',
        'Viper School Techniques',
        'Advanced Pyrotechnics',
        'Elemental Attunement',
        'Gourmand',
      ].map((name) => skill('General', name)),
    );

    build.removePoint(skill('General', 'Battle Frenzy'));

    expect(build.rank(skill('General', 'Strong Back'))).toBe(1);
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

  it('ignores a slot index the board does not have', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const build = withPoints(muscleMemory);
    const slots = build.slotCount;

    build.unslot(99);
    build.placeSkill(muscleMemory, -1);

    expect([build.slotCount, build.isSlotUnlocked(-1), build.slotOf(muscleMemory)]).toEqual([
      slots,
      false,
      -1,
    ]);
  });

  it('counts the rank of a skill only while it sits in a slot', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const build = withPoints(muscleMemory, muscleMemory);
    const unslotted = build.slottedRank(muscleMemory);

    build.placeSkill(muscleMemory, 0);

    expect([unslotted, build.slottedRank(muscleMemory)]).toEqual([0, 2]);
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

  it('adds the tree bonus of every slotted rank, but nothing for a skill outside the slots', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const threeStrikes = skill('Combat', 'Three Strikes');
    const build = withPoints(muscleMemory, muscleMemory, muscleMemory, threeStrikes, threeStrikes);
    build.placeSkill(muscleMemory, 0);

    const withOneSlotted = build.treeBonus('Combat');
    build.placeSkill(threeStrikes, 1);

    expect([withOneSlotted, build.treeBonus('Combat')]).toEqual([3, 5]);
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

  it('counts the extra slots that research has opened', () => {
    const build = new Build(catalog);
    const before = build.unlockedExtraSlots;

    build.research('deadly-counter');
    build.research('magic-sensibilities');
    build.research('bloodbath');
    build.research('piercing-cold');

    expect([before, build.unlockedExtraSlots]).toEqual([0, 2]);
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

  it('takes the mutations that need it along when one is unresearched', () => {
    const build = new Build(catalog);
    for (const id of [
      'magic-sensibilities',
      'piercing-cold',
      'deadly-counter',
      'bloodbath',
      'adrenaline-rush',
    ] as const) {
      build.research(id);
    }
    build.slotMutation('adrenaline-rush');

    build.unresearch('deadly-counter');

    const left = (['piercing-cold', 'bloodbath', 'adrenaline-rush'] as const).map((id) =>
      build.isResearched(id),
    );
    expect([...left, build.slottedMutation]).toEqual([true, false, false, null]);
  });
});

describe('Build mutagens', () => {
  it('ignores a mutagen group the board does not have', () => {
    const build = new Build(catalog);
    build.placeMutagen('green', 0);

    build.moveMutagen(0, 9);
    build.removeMutagen(7);

    expect([build.mutagenAt(0), build.mutagenCount]).toEqual(['green', 1]);
  });

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

describe('Build Toxicity', () => {
  it('raises maximum Toxicity with Acquired Tolerance only while it sits in a slot', () => {
    const build = withTrees('Alchemy');
    const acquiredTolerance = skill('Alchemy', 'Acquired Tolerance');
    const unslotted = build.maxToxicity();

    build.placeSkill(acquiredTolerance, 0);

    expect([unslotted, build.maxToxicity()]).toEqual([100, 100 + ALCHEMY_RECIPES]);
  });

  it('places a threshold skill at the share of the maximum its rank gives, only from a slot', () => {
    const build = withTrees('Alchemy');
    const delayedRecovery = skill('Alchemy', 'Delayed Recovery');
    build.addPoint(delayedRecovery);
    build.addPoint(delayedRecovery);
    const unslotted = build.toxicityThresholds();

    build.placeSkill(delayedRecovery, 0);

    expect(unslotted).toEqual([]);
    expect(build.toxicityThresholds()).toEqual([{ skill: delayedRecovery, toxicity: 100 * 0.6 }]);
  });

  it('counts the known recipes, Metabolic Control and the Manticore armor pieces', () => {
    const build = withTrees('Alchemy', 'General');
    build.placeSkill(skill('Alchemy', 'Acquired Tolerance'), 0);
    build.placeSkill(skill('General', 'Metabolic Control'), 1);
    build.toxicityPlan.setKnownRecipes(40);
    build.toxicityPlan.setManticorePieces(4);

    const max = build.maxToxicity();

    expect(max).toBe(100 + 40 + 10 + 4 * 5);
  });

  it('starts an overdose above half of the maximum', () => {
    const build = new Build(catalog);
    build.toxicityPlan.setManticorePieces(2);

    const threshold = build.overdoseToxicity();

    expect(threshold).toBe((100 + 10) / 2);
  });

  it('takes the Manticore pieces from the gear once armor is picked', () => {
    const build = new Build(catalog);
    build.toxicityPlan.setManticorePieces(4);
    const before = build.manticorePieces;

    build.gear.equip('armor', gear('Manticore armor'));
    build.gear.equip('gloves', gear('Grandmaster Feline gauntlets'));

    expect([before, build.manticorePieces, build.maxToxicity()]).toEqual([4, 1, 105]);
  });
});

describe('Build emptiness', () => {
  it('counts a build with only a mutagen as not empty', () => {
    const build = new Build(catalog);
    build.placeMutagen('green', 0);

    const empty = [new Build(catalog).isEmpty(), build.isEmpty()];

    expect(empty).toEqual([true, false]);
  });

  it('counts a build with only a potion as not empty', () => {
    const build = new Build(catalog);
    build.toxicityPlan.setPotionTier(potion('Swallow'), 1);

    expect(build.isEmpty()).toBe(false);
  });

  it('is empty again once its last point is removed', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const build = withPoints(muscleMemory);

    build.removePoint(muscleMemory);

    expect(build.isEmpty()).toBe(true);
  });
});

describe('Build snapshots', () => {
  it('ignores unknown names and anything against the rules', () => {
    const snapshot = aSnapshot({
      points: { Combat: { 'Flood of Anger': 3, Nope: 2 } },
      researched: ['second-life', 'not-a-mutation'],
      mutation: 'second-life',
      slots: [{ tree: 'Combat', name: 'Flood of Anger' }],
      mutagens: ['bogus'],
    });

    const build = Build.fromSnapshot(catalog, snapshot);

    expect(build.totalPoints()).toBe(0);
    expect(build.slotAt(0)).toBeNull();
    expect(build.mutagenAt(0)).toBeNull();
    expect(build.slottedMutation).toBeNull();
  });

  it('leaves the original untouched when a clone changes', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const original = withPoints(muscleMemory);

    const clone = original.clone();
    clone.addPoint(muscleMemory);

    expect([original.rank(muscleMemory), clone.rank(muscleMemory)]).toEqual([1, 2]);
  });
});
