import type { JSX } from 'react';
import type { Catalog } from '../catalog/catalog';
import { REMOVE_TIP, boardItemProps, type SlotProps } from './board-item';
import { dropTargetKey, type DropTarget } from './drag-and-drop';
import { BOARD_CENTRE, BOARD_SIZE, MUTATION_SLOT_RADIUS } from './geometry';
import { MutationDisc } from './mutation-disc';
import { useBoardTaps } from './use-board-taps';

// The mutation sits in the middle, its name to the left and what it does to the right.
export function MutationSlot({
  catalog,
  build,
  handlers,
  onPick,
}: SlotProps & { catalog: Catalog }): JSX.Element {
  const [cx, cy] = BOARD_CENTRE;
  const radius = MUTATION_SLOT_RADIUS;
  const target: DropTarget = { kind: 'mutation-slot' };
  const taps = useBoardTaps(
    () => {
      onPick(target);
    },
    () => {
      const held = build.slottedMutation;
      if (held !== null) handlers.onRemove({ kind: 'mutation', mutation: held, fromBoard: true });
    },
  );
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const mutation = catalog.mutation(build.slottedMutation);
  const innate = catalog.mutations.find((candidate) => candidate.innate);
  const circle = { left: cx - radius, top: cy - radius, width: 2 * radius, height: 2 * radius };
  const nameBox = { right: BOARD_SIZE.width - (cx - radius - 20), top: cy - 34 };
  const textBox = { left: cx + radius + 20, top: cy - 70 };

  if (mutation === undefined) {
    return (
      <>
        <div
          className={`mutation-slot${over}`}
          style={circle}
          role="button"
          tabIndex={0}
          aria-label="Empty mutation slot, click to pick a mutation"
          onClick={() => {
            onPick(target);
          }}
          onKeyDown={taps.onKeyDown}
        >
          {innate !== undefined && <MutationDisc mutation={innate} />}
        </div>
        <div className="mutation-title empty" style={nameBox}>
          <b>No mutation</b>
          <span>{build.researchedCount} researched</span>
        </div>
        <p className="mutation-text empty" style={textBox}>
          Drag a researched mutation onto the circle, or click it to pick one. Its colours decide
          which skills the four extra slots around it take.
        </p>
      </>
    );
  }

  return (
    <>
      <div
        className={`mutation-slot filled${over}`}
        style={circle}
        title={REMOVE_TIP}
        role="button"
        tabIndex={0}
        aria-label={mutation.name}
        onMouseEnter={() => {
          handlers.onHoverMutation(mutation);
        }}
        onFocus={() => {
          handlers.onHoverMutation(mutation);
        }}
        {...taps}
        {...boardItemProps({ kind: 'mutation', mutation: mutation.id, fromBoard: true }, handlers)}
      >
        <MutationDisc mutation={mutation} />
      </div>
      <div className="mutation-title" style={nameBox}>
        <b>{mutation.name}</b>
        <span>{mutation.trees.join(' / ')} mutation</span>
      </div>
      <p className="mutation-text" style={textBox}>
        {mutation.description}
      </p>
    </>
  );
}
