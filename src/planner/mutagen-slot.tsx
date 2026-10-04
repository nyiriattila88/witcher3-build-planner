import type { JSX } from 'react';
import { REMOVE_TIP, boardItemProps, type SlotProps } from './board-item';
import { dropTargetKey, type DropTarget } from './drag-and-drop';
import { MUTAGEN_SLOT_SIZE, mutagenSlotCentre } from './geometry';
import { MutagenGem } from './mutagen-gem';
import { useBoardTaps } from './use-board-taps';

// A group's mutagen diamond, with how many of the group's skills match it under it.
export function MutagenSlot({
  group,
  build,
  handlers,
  onPick,
}: SlotProps & { group: number }): JSX.Element {
  const [cx, cy] = mutagenSlotCentre(group);
  const target: DropTarget = { kind: 'mutagen-slot', group };
  const held = build.mutagenAt(group);
  const taps = useBoardTaps(
    () => {
      onPick(target);
    },
    () => {
      if (held !== null) handlers.onRemove({ kind: 'mutagen', mutagen: held, from: group });
    },
  );
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const half = MUTAGEN_SLOT_SIZE / 2;
  const position = { left: cx - half, top: cy - half };
  const bonus = build.mutagenBonus(group);

  if (bonus === null) {
    return (
      <div
        className={`mutagen-slot${over}`}
        style={position}
        role="button"
        tabIndex={0}
        aria-label="Empty mutagen slot, click to pick a mutagen"
        onClick={() => {
          onPick(target);
        }}
        onKeyDown={taps.onKeyDown}
      />
    );
  }

  const { mutagen, matching, synergy } = bonus;
  return (
    <>
      <div
        className={`mutagen-slot filled${over}`}
        style={position}
        title={REMOVE_TIP}
        role="button"
        tabIndex={0}
        aria-label={mutagen.name}
        onMouseEnter={() => {
          handlers.onHoverMutagen(mutagen);
        }}
        onFocus={() => {
          handlers.onHoverMutagen(mutagen);
        }}
        {...taps}
        {...boardItemProps({ kind: 'mutagen', mutagen: mutagen.id, from: group }, handlers)}
      >
        <MutagenGem mutagen={mutagen} />
      </div>
      <p className="mutagen-caption" style={{ left: cx - 55, top: cy + half * Math.SQRT2 + 6 }}>
        {matching} matching
        <br />
        {mutagen.tree} {matching === 1 ? 'skill' : 'skills'}
        {synergy > 0 && (
          <>
            <br />
            Synergy rank {synergy}
          </>
        )}
      </p>
    </>
  );
}
