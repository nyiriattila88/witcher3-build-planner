import { describe, expect, it } from 'vitest';
import { snapTarget, type DropTarget } from './drag-and-drop';
import { slotCentre } from './geometry';

const ICON = 62;
const anywhere = (): boolean => true;
const slotIndex = (target: DropTarget | null): number | null =>
  target?.kind === 'slot' ? target.index : null;

describe('snapTarget', () => {
  it('snaps to the slot the dragged icon covers most', () => {
    const [x, top] = slotCentre(0);
    const [, middle] = slotCentre(1);
    const nearerTheMiddle = top + (middle - top) * 0.6;

    const target = snapTarget([x, nearerTheMiddle], ICON, 16, anywhere);

    expect(slotIndex(target)).toBe(1);
  });

  it('takes a slot the icon covers well off-centre, not one it only brushes', () => {
    const [x, y] = slotCentre(0);

    const covered = snapTarget([x + 45, y], ICON, 16, anywhere);
    const brushed = snapTarget([x + 55, y], ICON, 16, anywhere);

    expect([slotIndex(covered), brushed]).toEqual([0, null]);
  });

  it('passes over a slot that refuses the item for the next one it covers', () => {
    const [x, top] = slotCentre(0);
    const [, middle] = slotCentre(1);
    const between = (top + middle) / 2 + 4;

    const target = snapTarget([x, between], ICON, 16, (t) => slotIndex(t) !== 1);

    expect(slotIndex(target)).toBe(0);
  });
});
