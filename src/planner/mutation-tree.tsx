import type { DragEvent, JSX } from 'react';
import type { Build } from '../build/build';
import type { Catalog, Mutation } from '../catalog/catalog';
import { backgroundUrl, mutationColour } from './appearance';
import type { DragItem } from './drag-and-drop';
import { FitToWidth } from './fit-to-width';
import { MUTATION_GRID, PANE_WIDTH, mutationCentre } from './geometry';
import { MutationDisc } from './mutation-disc';
import { useTouchTaps } from './use-touch-taps';

type MutationTreeProps = {
  readonly catalog: Catalog;
  readonly build: Build;
  readonly onResearch: (mutation: Mutation) => void;
  readonly onUnresearch: (mutation: Mutation) => void;
  readonly onHover: (mutation: Mutation) => void;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
};

export function MutationTree({ catalog, build, ...handlers }: MutationTreeProps): JSX.Element {
  const links = catalog.mutations.flatMap((mutation) =>
    mutation.requires.map((requiredId) => {
      const required = catalog.mutation(requiredId);
      const [x1, y1] = mutationCentre(required?.grid ?? mutation.grid);
      const [x2, y2] = mutationCentre(mutation.grid);
      const active = build.isResearched(requiredId) && build.isResearched(mutation.id);
      return (
        <line
          key={`${requiredId}-${mutation.id}`}
          className={active ? 'mutation-link active' : 'mutation-link'}
          style={active ? { stroke: mutationColour(mutation) } : undefined}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
        />
      );
    }),
  );

  return (
    <FitToWidth width={PANE_WIDTH} height={MUTATION_GRID.height}>
      <div
        className="pane-content"
        style={{
          width: PANE_WIDTH,
          height: MUTATION_GRID.height,
          backgroundImage: `url("${backgroundUrl('mutations')}")`,
          backgroundSize: '100% 100%',
        }}
      >
        <svg width={PANE_WIDTH} height={MUTATION_GRID.height}>
          {links}
        </svg>
        {catalog.mutations.map((mutation) => (
          <MutationNode key={mutation.id} mutation={mutation} build={build} {...handlers} />
        ))}
      </div>
    </FitToWidth>
  );
}

type MutationNodeProps = Omit<MutationTreeProps, 'catalog'> & { readonly mutation: Mutation };

function MutationNode({
  mutation,
  build,
  onResearch,
  onUnresearch,
  onHover,
  onDragStart,
}: MutationNodeProps): JSX.Element {
  const [x, y] = mutationCentre(mutation.grid);
  const state = build.isResearched(mutation.id)
    ? 'researched'
    : build.canResearch(mutation.id)
      ? 'available'
      : 'locked';
  const slotted = build.slottedMutation === mutation.id ? ' slotted' : '';
  const taps = useTouchTaps(
    () => {
      onResearch(mutation);
    },
    () => {
      onUnresearch(mutation);
    },
  );
  return (
    <div
      className={`mutation ${state}${slotted}`}
      style={{ left: x - MUTATION_GRID.label / 2, top: y - MUTATION_GRID.radius }}
      role="button"
      tabIndex={0}
      aria-label={`${mutation.name}, ${state}`}
      draggable={build.canSlotMutation(mutation.id)}
      onPointerDown={taps.onPointerDown}
      onClick={taps.onClick}
      onContextMenu={(event) => {
        event.preventDefault();
        onUnresearch(mutation);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onResearch(mutation);
        else if (event.key === 'Delete' || event.key === 'Backspace') onUnresearch(mutation);
      }}
      onMouseEnter={() => {
        onHover(mutation);
      }}
      onFocus={() => {
        onHover(mutation);
      }}
      onDragStart={(event) => {
        onDragStart({ kind: 'mutation', mutation: mutation.id, fromBoard: false }, event);
      }}
    >
      <span className="mutation-ring">
        <MutationDisc mutation={mutation} />
      </span>
      <span className="mutation-name">{mutation.name}</span>
    </div>
  );
}
