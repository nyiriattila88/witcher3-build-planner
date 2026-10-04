import type { DragEvent } from 'react';
import { MUTAGEN_GROUPS, type Build, type BuildView } from '../build/build';
import type { Skill } from '../catalog/catalog';
import type { MutagenId, MutationId } from '../data/mutations';
import {
  BOARD_CENTRE,
  MUTAGEN_SLOT_SIZE,
  MUTATION_SLOT_RADIUS,
  SLOT_SIZE,
  mutagenSlotCentre,
  slotCentre,
  type Point,
} from './geometry';

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

// Only the icon follows the pointer, centred on it, so what the user drags is the square a drop is
// measured with. Returns the icon's size.
export function centreDragImage(event: DragEvent): number {
  const host = event.currentTarget;
  const icon = host.querySelector('.tile, .mutation-ring, .disc, .gem img');
  if (icon === null) return SLOT_SIZE;
  // The browser draws a hover frame or a glow into the image and shifts the icon off the pointer, so
  // they are left out until the image is taken, which happens before the next task.
  host.classList.add('lifted');
  setTimeout(() => {
    host.classList.remove('lifted');
  }, 0);
  const box = icon.getBoundingClientRect();
  event.dataTransfer.setDragImage(icon, box.width / 2, box.height / 2);
  return Math.max(box.width, box.height);
}

type SnapBox = { readonly target: DropTarget; readonly centre: Point; readonly size: number };

// Every place on the board a drag can end, as a square of about its own area: a diamond as its square,
// the mutation's circle as the square of the same area.
const snapBoxes = (slotCount: number): readonly SnapBox[] => [
  ...Array.from({ length: slotCount }, (_, index): SnapBox => ({
    target: { kind: 'slot', index },
    centre: slotCentre(index),
    size: SLOT_SIZE,
  })),
  ...Array.from({ length: MUTAGEN_GROUPS }, (_, group): SnapBox => ({
    target: { kind: 'mutagen-slot', group },
    centre: mutagenSlotCentre(group),
    size: MUTAGEN_SLOT_SIZE,
  })),
  {
    target: { kind: 'mutation-slot' },
    centre: BOARD_CENTRE,
    size: MUTATION_SLOT_RADIUS * Math.sqrt(Math.PI),
  },
];

// How far two squares on one axis overlap, given the distance of their centres and their sizes.
const axisOverlap = (distance: number, a: number, b: number): number =>
  Math.max(0, Math.min(a, b, (a + b) / 2 - Math.abs(distance)));

// The drop target under a dragged icon centred on the given board point: of the targets that accept it
// and that the icon overlaps at all, the one it covers most. The snap follows the whole icon, not only
// the pointer.
export function snapTarget(
  point: Point,
  icon: number,
  slotCount: number,
  accepts: (target: DropTarget) => boolean,
): DropTarget | null {
  let best: { readonly target: DropTarget; readonly area: number } | null = null;
  for (const box of snapBoxes(slotCount)) {
    const area =
      axisOverlap(point[0] - box.centre[0], icon, box.size) *
      axisOverlap(point[1] - box.centre[1], icon, box.size);
    if (area <= 0 || (best !== null && area <= best.area)) continue;
    if (accepts(box.target)) best = { target: box.target, area };
  }
  return best?.target ?? null;
}

export const isFromBoard = (item: DragItem): boolean =>
  item.kind === 'mutation' ? item.fromBoard : item.from !== null;

export function acceptsDrop(build: BuildView, item: DragItem, target: DropTarget): boolean {
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
