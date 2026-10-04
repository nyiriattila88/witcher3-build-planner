import { describe, expect, it } from 'vitest';
import { Build } from '../build/build';
import type { Skill } from '../catalog/catalog';
import { createGameCatalog } from '../catalog/game-catalog';
import type { TreeName } from '../data/skills';
import { slotChoicesFor } from './slot-choice-list';

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

describe('slotChoicesFor', () => {
  it('lists the learned skills a slot takes and marks the one it holds', () => {
    const muscleMemory = skill('Combat', 'Muscle Memory');
    const build = withPoints(muscleMemory, skill('Combat', 'Three Strikes'));
    build.placeSkill(muscleMemory, 0);

    const list = slotChoicesFor(catalog, build, { kind: 'slot', index: 0 });

    expect(list.title).toBe('Skill slot, top left group');
    expect(list.held).toEqual({ kind: 'skill', skill: muscleMemory, from: 0 });
    expect(list.choices.map((choice) => [choice.label, choice.active])).toEqual([
      ['Muscle Memory 1/3', true],
      ['Three Strikes 1/3', false],
    ]);
  });

  it('offers an extra slot only the skills of the slotted mutation colours', () => {
    const build = withPoints(skill('Combat', 'Muscle Memory'), skill('Signs', 'Melt Armor'));
    build.research('deadly-counter');
    build.research('magic-sensibilities');
    build.slotMutation('deadly-counter');

    const list = slotChoicesFor(catalog, build, { kind: 'slot', index: 12 });

    expect(list.title).toBe('Extra skill slot');
    expect(list.choices.map((choice) => choice.label)).toEqual(['Muscle Memory 1/3']);
  });

  it('says what to do when no learned skill fits a slot', () => {
    const list = slotChoicesFor(catalog, new Build(catalog), { kind: 'slot', index: 3 });

    expect([list.choices, list.none, list.held]).toEqual([
      [],
      'Learn a skill that fits this slot first.',
      null,
    ]);
  });

  it('lists every mutagen for a mutagen slot and marks the one it holds', () => {
    const build = new Build(catalog);
    build.placeMutagen('green', 1);

    const list = slotChoicesFor(catalog, build, { kind: 'mutagen-slot', group: 1 });

    expect(list.title).toBe('Mutagen slot, top right group');
    expect(list.choices).toHaveLength(catalog.mutagens.length);
    expect(list.choices.filter((choice) => choice.active).map((choice) => choice.label)).toEqual([
      'Green Mutagen',
    ]);
  });

  it('offers the mutation slot only researched mutations', () => {
    const build = new Build(catalog);
    const before = slotChoicesFor(catalog, build, { kind: 'mutation-slot' });

    build.research('deadly-counter');
    const after = slotChoicesFor(catalog, build, { kind: 'mutation-slot' });

    expect([before.choices, before.none]).toEqual([[], 'Research a mutation first.']);
    expect(after.choices.map((choice) => choice.label)).toEqual(['Deadly Counter']);
  });
});
