import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { DOUBLE_TAP_MS } from './use-touch-taps';

type BoardTapHandlers = {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onClick: () => void;
  readonly onDoubleClick: () => void;
  // Enter or Space opens the list at once, Delete or Backspace takes the item off.
  readonly onKeyDown: (event: KeyboardEvent) => void;
};

// A board item opens its slot's list on a click and leaves the board on a double click, so unlike a
// tree node its click waits out the double-click window with a mouse too. A mouse double click is the
// browser's own, which keeps the user's double-click speed, a double tap is two taps in the window.
export function useBoardTaps(onTap: () => void, onDoubleTap: () => void): BoardTapHandlers {
  const touch = useRef(false);
  const pending = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(pending.current);
    },
    [],
  );
  // Drops a waiting tap and tells whether there was one.
  const cancel = (): boolean => {
    const waiting = pending.current !== undefined;
    window.clearTimeout(pending.current);
    pending.current = undefined;
    return waiting;
  };
  return {
    onPointerDown: (event) => {
      touch.current = event.pointerType === 'touch';
    },
    onClick: () => {
      if (cancel() && touch.current) {
        onDoubleTap();
        return;
      }
      pending.current = window.setTimeout(() => {
        pending.current = undefined;
        onTap();
      }, DOUBLE_TAP_MS);
    },
    onDoubleClick: () => {
      cancel();
      if (!touch.current) onDoubleTap();
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') onTap();
      else if (event.key === 'Delete' || event.key === 'Backspace') onDoubleTap();
      else return;
      // Space would scroll the page otherwise.
      event.preventDefault();
    },
  };
}
