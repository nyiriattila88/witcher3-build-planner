import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import type { Build } from '../build/build';
import {
  acceptsDrop,
  applyDiscard,
  applyDrop,
  centreDragImage,
  dropTargetKey,
  isFromBoard,
  type DragItem,
  type DropTarget,
} from '../planner/drag-and-drop';

export type DragAndDrop = {
  readonly overKey: string | null;
  readonly start: (item: DragItem, event: DragEvent) => void;
  readonly over: (target: DropTarget, event: DragEvent) => void;
  readonly leave: (target: DropTarget) => void;
  readonly drop: (target: DropTarget, event: DragEvent) => void;
};

export function useDragAndDrop(
  build: Build,
  apply: (change: (draft: Build) => void) => void,
): DragAndDrop {
  const dragged = useRef<DragItem | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  // A board item dropped anywhere but an accepting slot leaves the board, so the whole page takes it.
  // React runs the slots' own handlers first, and a slot that took the drop has cleared the item.
  useEffect(() => {
    const allowBoardItems = (event: globalThis.DragEvent): void => {
      const item = dragged.current;
      if (item !== null && isFromBoard(item)) event.preventDefault();
    };
    const discard = (event: globalThis.DragEvent): void => {
      const item = dragged.current;
      if (item === null) return;
      event.preventDefault();
      dragged.current = null;
      setOverKey(null);
      if (isFromBoard(item)) {
        apply((draft) => {
          applyDiscard(draft, item);
        });
      }
    };
    const finish = (): void => {
      dragged.current = null;
      setOverKey(null);
    };
    document.addEventListener('dragover', allowBoardItems);
    document.addEventListener('drop', discard);
    document.addEventListener('dragend', finish);
    return () => {
      document.removeEventListener('dragover', allowBoardItems);
      document.removeEventListener('drop', discard);
      document.removeEventListener('dragend', finish);
    };
  }, [apply]);

  const start = useCallback((item: DragItem, event: DragEvent) => {
    dragged.current = item;
    event.dataTransfer.setData('text/plain', item.kind);
    event.dataTransfer.effectAllowed = 'move';
    centreDragImage(event);
  }, []);

  const over = useCallback(
    (target: DropTarget, event: DragEvent) => {
      const item = dragged.current;
      if (item === null || !acceptsDrop(build, item, target)) return;
      event.preventDefault();
      setOverKey(dropTargetKey(target));
    },
    [build],
  );

  const leave = useCallback((target: DropTarget) => {
    setOverKey((key) => (key === dropTargetKey(target) ? null : key));
  }, []);

  const drop = useCallback(
    (target: DropTarget, event: DragEvent) => {
      const item = dragged.current;
      if (item === null || !acceptsDrop(build, item, target)) return;
      event.preventDefault();
      dragged.current = null;
      setOverKey(null);
      apply((draft) => {
        applyDrop(draft, item, target);
      });
    },
    [build, apply],
  );

  return { overKey, start, over, leave, drop };
}
