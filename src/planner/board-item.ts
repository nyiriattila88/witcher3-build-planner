import type { DragEvent } from 'react';
import type { BuildView } from '../build/build';
import type { Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { DragItem, DropTarget } from './drag-and-drop';

// What the board hands each of its slots: where a drag is over, and what a slot reports back.
export type BoardHandlers = {
  readonly overKey: string | null;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
  readonly onRemove: (item: DragItem) => void;
  // Puts what was picked from the list of a slot into it.
  readonly onPlace: (item: DragItem, target: DropTarget) => void;
  readonly onHoverSkill: (skill: Skill) => void;
  readonly onHoverMutagen: (mutagen: Mutagen) => void;
  readonly onHoverMutation: (mutation: Mutation) => void;
};

export type SlotProps = {
  readonly build: BuildView;
  readonly handlers: BoardHandlers;
  // Opens the list of what the slot can take.
  readonly onPick: (target: DropTarget) => void;
};

export const REMOVE_TIP = 'Drag to move, double-click to remove, click to change';

type BoardItemProps = {
  readonly draggable: true;
  readonly onDragStart: (event: DragEvent) => void;
};

// Props of a board item: dragging moves it.
export const boardItemProps = (
  item: DragItem,
  handlers: BoardHandlers,
  onPickUp?: () => void,
): BoardItemProps => ({
  draggable: true,
  onDragStart: (event: DragEvent) => {
    onPickUp?.();
    handlers.onDragStart(item, event);
  },
});
