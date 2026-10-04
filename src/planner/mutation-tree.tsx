import { useState, type DragEvent, type JSX } from 'react';
import type { BuildView } from '../build/build';
import type { Catalog, Mutation } from '../catalog/catalog';
import { backgroundUrl, mutationColour } from './appearance';
import type { DragItem } from './drag-and-drop';
import { FitToWidth } from './fit-to-width';
import { MUTATION_GRID, PANE_WIDTH, mutationCentre, tooltipPlacement } from './geometry';
import { MutationDisc } from './mutation-disc';
import { MutationTooltip } from './mutation-tooltip';
import { useNodeControls } from './use-node-controls';

type MutationTreeProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onResearch: (mutation: Mutation) => void;
  readonly onUnresearch: (mutation: Mutation) => void;
  readonly onHover: (mutation: Mutation) => void;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
};

const PANE_SIZE = { width: PANE_WIDTH, height: MUTATION_GRID.height };

export function MutationTree({ catalog, build, ...handlers }: MutationTreeProps): JSX.Element {
  const [hovered, setHovered] = useState<Mutation | null>(null);
  const links = catalog.mutations.flatMap((mutation) =>
    mutation.requires.map((requiredId) => {
      const [x1, y1] = mutationCentre(catalog.mutation(requiredId).grid);
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
    <FitToWidth {...PANE_SIZE}>
      <div
        className="pane-content"
        style={{
          ...PANE_SIZE,
          backgroundImage: `url("${backgroundUrl('mutations')}")`,
          backgroundSize: '100% 100%',
        }}
      >
        <svg {...PANE_SIZE}>{links}</svg>
        {catalog.mutations.map((mutation) => (
          <MutationNode
            key={mutation.id}
            mutation={mutation}
            build={build}
            {...handlers}
            onHover={(target) => {
              setHovered(target);
              handlers.onHover(target);
            }}
            onLeave={() => {
              setHovered(null);
            }}
            onDragStart={(item, event) => {
              setHovered(null);
              handlers.onDragStart(item, event);
            }}
          />
        ))}
        {hovered !== null && (
          <MutationTooltip
            mutation={hovered}
            catalog={catalog}
            placement={tooltipPlacement(
              mutationCentre(hovered.grid),
              MUTATION_GRID.radius,
              PANE_SIZE,
            )}
          />
        )}
      </div>
    </FitToWidth>
  );
}

type MutationNodeProps = Omit<MutationTreeProps, 'catalog'> & {
  readonly mutation: Mutation;
  readonly onLeave: () => void;
};

function MutationNode({
  mutation,
  build,
  onResearch,
  onUnresearch,
  onHover,
  onLeave,
  onDragStart,
}: MutationNodeProps): JSX.Element {
  const [x, y] = mutationCentre(mutation.grid);
  const state = build.isResearched(mutation.id)
    ? 'researched'
    : build.canResearch(mutation.id)
      ? 'available'
      : 'locked';
  const slotted = build.slottedMutation === mutation.id ? ' slotted' : '';
  const controls = useNodeControls(
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
      {...controls}
      onMouseEnter={() => {
        onHover(mutation);
      }}
      onMouseLeave={onLeave}
      onFocus={() => {
        onHover(mutation);
      }}
      onBlur={onLeave}
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
