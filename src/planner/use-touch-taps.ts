import { useEffect, useRef, type PointerEvent } from 'react';

// Android's default double-tap timeout.
export const DOUBLE_TAP_MS = 300;

type TapHandlers = {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onClick: () => void;
};

// A touch screen has no right-click, so there a double tap takes back what a tap gives. A tap waits out
// the double-tap window before it counts, a mouse click counts at once.
export function useTouchTaps(onTap: () => void, onDoubleTap: () => void): TapHandlers {
  const touch = useRef(false);
  const pending = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(pending.current);
    },
    [],
  );
  return {
    onPointerDown: (event) => {
      touch.current = event.pointerType === 'touch';
    },
    onClick: () => {
      if (!touch.current) {
        onTap();
        return;
      }
      if (pending.current !== undefined) {
        window.clearTimeout(pending.current);
        pending.current = undefined;
        onDoubleTap();
        return;
      }
      pending.current = window.setTimeout(() => {
        pending.current = undefined;
        onTap();
      }, DOUBLE_TAP_MS);
    },
  };
}
