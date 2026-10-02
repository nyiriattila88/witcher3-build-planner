import type { Build } from '../build/build';
import type { Skill } from '../catalog/catalog';
import type { MutagenId, MutationId } from '../data/mutations';

// What is being dragged. An item that comes from the board carries where it sits there in "from",
// one picked up from a pane carries null.
export type DragItem =
  | { readonly kind: 'skill'; readonly skill: Skill; readonly from: number | null }
  | { readonly kind: 'mutagen'; readonly mutagen: MutagenId; readonly from: number | null }
  | { readonly kind: 'mutation'; readonly mutation: MutationId; readonly fromBoard: boolean };

export type DropTarget =
  | { readonly kind: 'slot'; readonly index: number }
  | { readonly kind: 'mutagen-slot'; readonly group: number }
  | { readonly kind: 'mutation-slot' };

export const dropTargetKey = (target: DropTarget): string => {
  switch (target.kind) {
    case 'slot':
      return `slot-${target.index}`;
    case 'mutagen-slot':
      return `mutagen-slot-${target.group}`;
    case 'mutation-slot':
      return 'mutation-slot';
  }
};

export const isFromBoard = (item: DragItem): boolean =>
  item.kind === 'mutation' ? item.fromBoard : item.from !== null;

export function acceptsDrop(build: Build, item: DragItem, target: DropTarget): boolean {
  if (item.kind === 'skill' && target.kind === 'slot')
    return build.slotAccepts(target.index, item.skill);
  if (item.kind === 'mutagen' && target.kind === 'mutagen-slot') return true;
  if (item.kind === 'mutation' && target.kind === 'mutation-slot') {
    return build.canSlotMutation(item.mutation);
  }
  return false;
}

// Applies a drop to a build the caller owns. A target that does not accept the item changes nothing.
export function applyDrop(build: Build, item: DragItem, target: DropTarget): void {
  if (!acceptsDrop(build, item, target)) return;
  if (item.kind === 'skill' && target.kind === 'slot') {
    build.placeSkill(item.skill, target.index);
  } else if (item.kind === 'mutagen' && target.kind === 'mutagen-slot') {
    if (item.from === null) build.placeMutagen(item.mutagen, target.group);
    else build.moveMutagen(item.from, target.group);
  } else if (item.kind === 'mutation') {
    build.slotMutation(item.mutation);
  }
}

// An item dragged off the board leaves it.
export function applyDiscard(build: Build, item: DragItem): void {
  switch (item.kind) {
    case 'skill':
      if (item.from !== null) build.unslot(item.from);
      return;
    case 'mutagen':
      if (item.from !== null) build.removeMutagen(item.from);
      return;
    case 'mutation':
      if (item.fromBoard) build.unslotMutation();
      return;
  }
}
