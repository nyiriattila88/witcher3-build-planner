import { useCallback, useEffect, useRef, useState, type DragEvent, type RefObject } from 'react';
import type { Build } from '../build/build';
import {
  acceptsDrop,
  applyDiscard,
  applyDrop,
  centreDragImage,
  dropTargetKey,
  isFromBoard,
  snapTarget,
  type DragItem,
  type DropTarget,
} from '../planner/drag-and-drop';
import { BOARD_SIZE } from '../planner/geometry';

export type DragAndDrop = {
  readonly overKey: string | null;
  // The slot board, which the drop targets are measured against.
  readonly boardRef: RefObject<HTMLDivElement | null>;
  readonly start: (item: DragItem, event: DragEvent) => void;
};

type Drag = { readonly item: DragItem; readonly icon: number };

export function useDragAndDrop(
  build: Build,
  apply: (change: (draft: Build) => void) => void,
): DragAndDrop {
  const dragged = useRef<Drag | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const latestBuild = useRef(build);
  const [overKey, setOverKey] = useState<string | null>(null);

  useEffect(() => {
    latestBuild.current = build;
  }, [build]);

  // The whole page follows the drag, so the target comes from where the dragged icon covers the board,
  // not from the element under the pointer. A board item let go off the board leaves the build.
  useEffect(() => {
    const targetOf = (event: globalThis.DragEvent, drag: Drag): DropTarget | null => {
      const board = boardRef.current?.getBoundingClientRect();
      if (board === undefined) return null;
      const current = latestBuild.current;
      // The board may be shown scaled down, while the targets are laid out at its own size.
      const scale = board.width / BOARD_SIZE.width;
      return snapTarget(
        [(event.clientX - board.left) / scale, (event.clientY - board.top) / scale],
        drag.icon / scale,
        current.slotCount,
        (target) => acceptsDrop(current, drag.item, target),
      );
    };
    const over = (event: globalThis.DragEvent): void => {
      const drag = dragged.current;
      if (drag === null) return;
      const target = targetOf(event, drag);
      setOverKey(target === null ? null : dropTargetKey(target));
      if (target !== null || isFromBoard(drag.item)) event.preventDefault();
    };
    const drop = (event: globalThis.DragEvent): void => {
      const drag = dragged.current;
      if (drag === null) return;
      event.preventDefault();
      const target = targetOf(event, drag);
      dragged.current = null;
      setOverKey(null);
      if (target !== null) {
        apply((draft) => {
          applyDrop(draft, drag.item, target);
        });
      } else if (isFromBoard(drag.item)) {
        apply((draft) => {
          applyDiscard(draft, drag.item);
        });
      }
    };
    const finish = (): void => {
      dragged.current = null;
      setOverKey(null);
    };
    document.addEventListener('dragover', over);
    document.addEventListener('drop', drop);
    document.addEventListener('dragend', finish);
    return () => {
      document.removeEventListener('dragover', over);
      document.removeEventListener('drop', drop);
      document.removeEventListener('dragend', finish);
    };
  }, [apply]);

  const start = useCallback((item: DragItem, event: DragEvent) => {
    event.dataTransfer.setData('text/plain', item.kind);
    event.dataTransfer.effectAllowed = 'move';
    dragged.current = { item, icon: centreDragImage(event) };
  }, []);

  return { overKey, boardRef, start };
}
