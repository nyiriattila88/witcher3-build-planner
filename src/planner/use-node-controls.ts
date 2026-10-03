import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useTouchTaps } from './use-touch-taps';

type NodeControls = {
  readonly onPointerDown: (event: PointerEvent) => void;
  readonly onClick: () => void;
  readonly onContextMenu: (event: MouseEvent) => void;
  readonly onKeyDown: (event: KeyboardEvent) => void;
};

// How a node of a tree gives and takes back, a skill rank or a mutation's research alike: a click, a
// tap, Enter or Space gives, a right-click, a double tap, Delete or Backspace takes back.
export function useNodeControls(give: () => void, takeBack: () => void): NodeControls {
  const taps = useTouchTaps(give, takeBack);
  return {
    ...taps,
    onContextMenu: (event) => {
      event.preventDefault();
      takeBack();
    },
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') give();
      else if (event.key === 'Delete' || event.key === 'Backspace') takeBack();
      else return;
      // Space would scroll the page otherwise.
      event.preventDefault();
    },
  };
}
