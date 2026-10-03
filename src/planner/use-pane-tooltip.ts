import { useState, type CSSProperties, type RefObject } from 'react';
import { placementBeside } from './geometry';

type PaneTip<T> = { readonly content: T; readonly placement: CSSProperties };

type PaneTooltip<T> = {
  readonly tip: PaneTip<T> | null;
  readonly show: (target: Element | null, content: T) => void;
  readonly hide: () => void;
};

// Where an element sits inside the pane.
const boxIn = (element: Element, pane: Element): DOMRect => {
  const outer = pane.getBoundingClientRect();
  const inner = element.getBoundingClientRect();
  return new DOMRect(inner.left - outer.left, inner.top - outer.top, inner.width, inner.height);
};

// The in-game tooltip of a pane: beside what is under the pointer, on the side facing the middle of
// the pane, as on the board.
export function usePaneTooltip<T>(pane: RefObject<HTMLElement | null>): PaneTooltip<T> {
  const [tip, setTip] = useState<PaneTip<T> | null>(null);
  return {
    tip,
    show: (target, content) => {
      const root = pane.current;
      if (root === null || target === null) return;
      setTip({
        content,
        placement: placementBeside(boxIn(target, root), root.getBoundingClientRect()),
      });
    },
    hide: () => {
      setTip(null);
    },
  };
}
