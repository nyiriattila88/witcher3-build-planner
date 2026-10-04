import { BASE_SLOTS, MAX_RANK, slotGroup, type BuildView } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import { GROUP_NAMES, mutagenColour, mutationColour, treeColour } from './appearance';
import { acceptsDrop, type DragItem, type DropTarget } from './drag-and-drop';

type SlotChoice = {
  readonly key: string;
  readonly label: string;
  readonly colour: string;
  readonly item: DragItem;
  readonly active: boolean;
};

type SlotChoiceList = {
  readonly title: string;
  // What the slot holds now, which emptying it takes off.
  readonly held: DragItem | null;
  readonly choices: readonly SlotChoice[];
  readonly none: string;
};

// What a slot can take, with the rules of a drop on it.
export function slotChoicesFor(
  catalog: Catalog,
  build: BuildView,
  target: DropTarget,
): SlotChoiceList {
  switch (target.kind) {
    case 'slot': {
      const current = build.slotAt(target.index);
      const group = GROUP_NAMES[slotGroup(target.index)] ?? '';
      return {
        title:
          target.index < BASE_SLOTS
            ? `Skill slot, ${group.toLowerCase()} group`
            : 'Extra skill slot',
        held: current === null ? null : { kind: 'skill', skill: current, from: target.index },
        choices: catalog.skills.flatMap((skill): SlotChoice[] => {
          const from = build.slotOf(skill);
          const item: DragItem = { kind: 'skill', skill, from: from < 0 ? null : from };
          if (!acceptsDrop(build, item, target)) return [];
          return [
            {
              key: `${skill.tree}/${skill.name}`,
              label: `${skill.name} ${build.rank(skill)}/${MAX_RANK}`,
              colour: treeColour(skill.tree),
              item,
              active: skill === current,
            },
          ];
        }),
        none: 'Learn a skill that fits this slot first.',
      };
    }
    case 'mutagen-slot': {
      const current = build.mutagenAt(target.group);
      const group = GROUP_NAMES[target.group] ?? '';
      return {
        title: `Mutagen slot, ${group.toLowerCase()} group`,
        held: current === null ? null : { kind: 'mutagen', mutagen: current, from: target.group },
        choices: catalog.mutagens.map((mutagen) => ({
          key: mutagen.id,
          label: mutagen.name,
          colour: mutagenColour(mutagen),
          item: { kind: 'mutagen', mutagen: mutagen.id, from: null },
          active: mutagen.id === current,
        })),
        none: '',
      };
    }
    case 'mutation-slot': {
      const current = build.slottedMutation;
      return {
        title: 'Mutation slot',
        held: current === null ? null : { kind: 'mutation', mutation: current, fromBoard: true },
        choices: catalog.mutations
          .filter((mutation) => build.canSlotMutation(mutation.id))
          .map((mutation) => ({
            key: mutation.id,
            label: mutation.name,
            colour: mutationColour(mutation),
            item: { kind: 'mutation', mutation: mutation.id, fromBoard: false },
            active: mutation.id === current,
          })),
        none: 'Research a mutation first.',
      };
    }
  }
}
