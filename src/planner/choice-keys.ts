// What a key does to a list that picks one entry: open it on an entry, browse to another, pick the one
// browsed, or close it without picking. The entries are counted from the empty one at 0.
export type ChoiceKeyAction =
  | { readonly kind: 'open'; readonly index: number }
  | { readonly kind: 'browse'; readonly index: number }
  | { readonly kind: 'pick'; readonly index: number }
  | { readonly kind: 'close' };

type ChoiceList = {
  readonly open: boolean;
  // The entry browsed while the list is open.
  readonly active: number;
  // The entry picked now, where the list opens.
  readonly held: number;
  readonly count: number;
};

// The keys of a select-only combobox, after the WAI-ARIA pattern. A key it does not use gives null.
export function choiceKeyAction(key: string, list: ChoiceList): ChoiceKeyAction | null {
  const last = list.count - 1;
  if (!list.open) {
    switch (key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        return { kind: 'open', index: list.held };
      case 'Home':
        return { kind: 'open', index: 0 };
      case 'End':
        return { kind: 'open', index: last };
      default:
        return null;
    }
  }
  switch (key) {
    case 'ArrowDown':
      return { kind: 'browse', index: Math.min(last, list.active + 1) };
    case 'ArrowUp':
      return { kind: 'browse', index: Math.max(0, list.active - 1) };
    case 'Home':
      return { kind: 'browse', index: 0 };
    case 'End':
      return { kind: 'browse', index: last };
    case 'Enter':
    case ' ':
      return { kind: 'pick', index: list.active };
    case 'Escape':
    case 'Tab':
      return { kind: 'close' };
    default:
      return null;
  }
}
