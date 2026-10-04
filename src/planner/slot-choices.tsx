import type { JSX } from 'react';
import type { Build } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import type { BoardHandlers } from './board-item';
import type { DropTarget } from './drag-and-drop';
import { slotChoicesFor } from './slot-choice-list';

// The list opens under the board, which on a phone is out of sight.
const bringIntoView = (element: HTMLElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

// The list of what a slot can take, under the board. Picking from it works without dragging, as on a
// phone.
export function SlotChoices({
  catalog,
  build,
  target,
  handlers,
  onClose,
}: {
  catalog: Catalog;
  build: Build;
  target: DropTarget;
  handlers: BoardHandlers;
  onClose: () => void;
}): JSX.Element {
  const { title, held, choices, none } = slotChoicesFor(catalog, build, target);
  return (
    <section ref={bringIntoView} className="slot-choices" aria-label={title}>
      <div className="slot-choices-head">
        <b>{title}</b>
        <span>
          {held !== null && (
            <button
              type="button"
              onClick={() => {
                handlers.onRemove(held);
                onClose();
              }}
            >
              Empty it
            </button>
          )}
          <button type="button" onClick={onClose}>
            Close
          </button>
        </span>
      </div>
      {choices.length === 0 ? (
        <p className="slot-choices-none">{none}</p>
      ) : (
        <div className="slot-choices-list">
          {choices.map(({ key, label, colour, item, active }) => (
            <button
              key={key}
              type="button"
              className={active ? 'active' : undefined}
              style={{ borderLeftColor: colour }}
              aria-pressed={active}
              onClick={() => {
                handlers.onPlace(item, target);
                onClose();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
