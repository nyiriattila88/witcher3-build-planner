import { describe, expect, it } from 'vitest';
import { choiceKeyAction } from './choice-keys';

const closed = { open: false, active: 0, held: 2, count: 5 };
const open = { open: true, active: 2, held: 2, count: 5 };

describe('choiceKeyAction', () => {
  it('opens a closed list on the entry it holds', () => {
    const actions = ['ArrowDown', 'Enter', ' '].map((key) => choiceKeyAction(key, closed));

    expect(actions).toEqual(Array(3).fill({ kind: 'open', index: 2 }));
  });

  it('browses an open list one entry at a time and stops at both ends', () => {
    const atTop = { ...open, active: 0 };
    const atBottom = { ...open, active: 4 };

    const moves = [
      choiceKeyAction('ArrowDown', open),
      choiceKeyAction('ArrowUp', open),
      choiceKeyAction('ArrowUp', atTop),
      choiceKeyAction('ArrowDown', atBottom),
      choiceKeyAction('End', open),
    ];

    expect(moves.map((move) => (move?.kind === 'browse' ? move.index : null))).toEqual([
      3, 1, 0, 4, 4,
    ]);
  });

  it('picks the entry browsed with Enter or Space', () => {
    const browsed = { ...open, active: 3 };

    const picks = ['Enter', ' '].map((key) => choiceKeyAction(key, browsed));

    expect(picks).toEqual(Array(2).fill({ kind: 'pick', index: 3 }));
  });

  it('closes without picking on Escape or Tab, and leaves other keys to the browser', () => {
    const actions = ['Escape', 'Tab', 'a'].map((key) => choiceKeyAction(key, open));

    expect(actions).toEqual([{ kind: 'close' }, { kind: 'close' }, null]);
  });
});
