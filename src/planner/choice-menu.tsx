import { useEffect, useId, useRef, useState, type JSX, type KeyboardEvent } from 'react';
import { choiceKeyAction } from './choice-keys';

type ChoiceMenuProps<T extends { readonly name: string }> = {
  readonly label: string;
  readonly options: readonly T[];
  readonly held: T | null;
  // What the empty entry says, such as "Empty" for a socket.
  readonly empty: string;
  readonly describe: (option: T) => string;
  readonly onPick: (option: T | null) => void;
  // Shows an option in the info panel while it is pointed at or browsed with the keys.
  readonly onHover: (option: T) => void;
};

// Keeps the browsed entry of a long list in sight.
const reveal = (element: HTMLElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

// A select whose open list tells the info panel what each option is while it is browsed, with the
// mouse or the arrow keys, the way a skill does. The browser's own select gives no events for that.
export function ChoiceMenu<T extends { readonly name: string }>({
  label,
  options,
  held,
  empty,
  describe,
  onPick,
  onHover,
}: ChoiceMenuProps<T>): JSX.Element {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const entries: readonly (T | null)[] = [null, ...options];
  const heldIndex = held === null ? 0 : options.indexOf(held) + 1;

  // A click anywhere else closes the list.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent): void => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
    };
  }, [open]);

  const browse = (index: number): void => {
    setActive(index);
    const entry = entries[index];
    if (entry !== undefined && entry !== null) onHover(entry);
  };

  const pick = (index: number): void => {
    const entry = entries[index] ?? null;
    onPick(entry);
    if (entry !== null) onHover(entry);
    setOpen(false);
    trigger.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    const action = choiceKeyAction(event.key, {
      open,
      active,
      held: heldIndex,
      count: entries.length,
    });
    if (action === null) return;
    // Tab still moves the focus on.
    if (event.key !== 'Tab') event.preventDefault();
    switch (action.kind) {
      case 'open':
        setOpen(true);
        browse(action.index);
        return;
      case 'browse':
        browse(action.index);
        return;
      case 'pick':
        pick(action.index);
        return;
      case 'close':
        setOpen(false);
        return;
    }
  };

  return (
    <div ref={root} className="gear-socket">
      <span id={`${id}label`}>{label}</span>
      <div className="choice-field">
        <button
          ref={trigger}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}list`}
          aria-labelledby={`${id}label`}
          aria-activedescendant={open ? `${id}${active}` : undefined}
          onClick={() => {
            if (!open) browse(heldIndex);
            setOpen(!open);
          }}
          onKeyDown={onKeyDown}
          onMouseEnter={() => {
            if (held !== null) onHover(held);
          }}
        >
          {held === null ? empty : describe(held)}
        </button>
        {open && (
          <ul
            id={`${id}list`}
            role="listbox"
            aria-labelledby={`${id}label`}
            className="choice-list"
          >
            {entries.map((entry, index) => (
              <li
                key={entry?.name ?? ''}
                ref={index === active ? reveal : undefined}
                id={`${id}${index}`}
                role="option"
                aria-selected={index === heldIndex}
                className={index === active ? 'active' : undefined}
                onMouseEnter={() => {
                  browse(index);
                }}
                // The combobox keeps the focus, so its keys go on working.
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  pick(index);
                }}
              >
                {entry === null ? empty : describe(entry)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
