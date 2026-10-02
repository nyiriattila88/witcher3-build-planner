import type { DragEvent, JSX } from 'react';
import {
  BASE_SLOTS,
  MAX_RANK,
  MUTAGEN_GROUPS,
  SLOTS_PER_GROUP,
  slotGroup,
  type Build,
} from '../build/build';
import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import {
  iconUrl,
  mutagenColour,
  mutagenEffect,
  mutagenLabel,
  mutationColour,
  plural,
  treeColour,
} from './appearance';
import { dropTargetKey, type DragItem, type DropTarget } from './drag-and-drop';
import {
  BOARD_SIZE,
  MUTAGEN_SLOT_CENTRES,
  MUTAGEN_SLOT_SIZE,
  MUTATION_SLOT_POSITION,
  SLOT_SIZE,
  slotPosition,
} from './geometry';

type BoardHandlers = {
  readonly overKey: string | null;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
  readonly onDragOver: (target: DropTarget, event: DragEvent) => void;
  readonly onDragLeave: (target: DropTarget) => void;
  readonly onDrop: (target: DropTarget, event: DragEvent) => void;
  readonly onRemove: (item: DragItem) => void;
  readonly onHoverSkill: (skill: Skill) => void;
  readonly onHoverMutagen: (mutagen: Mutagen) => void;
  readonly onHoverMutation: (mutation: Mutation) => void;
};

type SlotBoardProps = BoardHandlers & { readonly catalog: Catalog; readonly build: Build };

const groups = Array.from({ length: MUTAGEN_GROUPS }, (_, group) => group);

// Drop-target props shared by every slot of the board.
const dropTargetProps = (target: DropTarget, handlers: BoardHandlers) => ({
  onDragOver: (event: DragEvent) => {
    handlers.onDragOver(target, event);
  },
  onDragLeave: () => {
    handlers.onDragLeave(target);
  },
  onDrop: (event: DragEvent) => {
    handlers.onDrop(target, event);
  },
});

export function SlotBoard({ catalog, build, ...handlers }: SlotBoardProps): JSX.Element {
  return (
    <div className="board" style={BOARD_SIZE}>
      <svg width={BOARD_SIZE.width} height={BOARD_SIZE.height}>
        {groups.map((group) => (
          <GroupBracket
            key={group}
            group={group}
            mutagen={catalog.mutagen(build.mutagenAt(group))}
          />
        ))}
      </svg>
      {Array.from({ length: build.slotCount }, (_, index) => (
        <SkillSlot key={index} index={index} catalog={catalog} build={build} handlers={handlers} />
      ))}
      {groups.map((group) => (
        <MutagenSlot key={group} group={group} build={build} handlers={handlers} />
      ))}
      <MutationSlot catalog={catalog} build={build} handlers={handlers} />
    </div>
  );
}

// The bracket joins a group's three slots to its mutagen slot, in the mutagen's colour once one is placed.
function GroupBracket({
  group,
  mutagen,
}: {
  group: number;
  mutagen: Mutagen | undefined;
}): JSX.Element {
  const right = group % 2 === 1;
  const [first, middle, last] = [0, 1, 2].map((i) => slotPosition(group * SLOTS_PER_GROUP + i));
  const centre = MUTAGEN_SLOT_CENTRES[group] ?? [0, 0];
  const edge = (first?.[0] ?? 0) + (right ? SLOT_SIZE : 0);
  const spine = edge + (right ? 18 : -18);
  const half = SLOT_SIZE / 2;
  const vertex = centre[0] + ((right ? -1 : 1) * MUTAGEN_SLOT_SIZE) / Math.SQRT2;
  const top = (first?.[1] ?? 0) + half;
  const mid = (middle?.[1] ?? 0) + half;
  const bottom = (last?.[1] ?? 0) + half;
  return (
    <path
      className="bracket"
      style={mutagen === undefined ? undefined : { stroke: mutagenColour(mutagen), strokeWidth: 3 }}
      d={`M${edge} ${top} H${spine} V${bottom} H${edge} M${edge} ${mid} H${spine} M${spine} ${mid} H${vertex}`}
    />
  );
}

type SlotProps = { readonly build: Build; readonly handlers: BoardHandlers };

function SkillSlot({
  index,
  catalog,
  build,
  handlers,
}: SlotProps & { index: number; catalog: Catalog }): JSX.Element {
  const [x, y] = slotPosition(index);
  const target: DropTarget = { kind: 'slot', index };
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const position = { left: x, top: y };

  if (!build.isSlotUnlocked(index)) {
    const needed = catalog.extraSlotUnlocks[index - BASE_SLOTS] ?? 0;
    return (
      <div
        className="slot locked"
        style={position}
        title={`Unlocks at ${needed} researched mutations`}
        aria-label="Locked slot"
      >
        🔒
      </div>
    );
  }

  const accepts = index >= BASE_SLOTS ? <AcceptedTrees build={build} /> : null;
  const mutagen =
    index < BASE_SLOTS ? catalog.mutagen(build.mutagenAt(slotGroup(index))) : undefined;
  const skill = build.slotAt(index);
  if (skill === null) {
    return (
      <div
        className={`slot${over}`}
        style={
          mutagen === undefined ? position : { ...position, borderColor: mutagenColour(mutagen) }
        }
        {...dropTargetProps(target, handlers)}
      >
        {index + 1}
        {accepts}
      </div>
    );
  }

  // A skill matching its group's mutagen glows, since it raises the bonus.
  const frame =
    mutagen === undefined
      ? {}
      : build.slotMatchesMutagen(index)
        ? {
            borderColor: '#fff',
            boxShadow: `0 0 0 2px ${mutagenColour(mutagen)}, 0 0 14px ${mutagenColour(mutagen)}`,
          }
        : { boxShadow: `0 0 0 2px ${mutagenColour(mutagen)}` };
  const item: DragItem = { kind: 'skill', skill, from: index };
  return (
    <div
      className={`slot filled${over}`}
      style={{ ...position, background: treeColour(skill.tree), ...frame }}
      draggable
      onDragStart={(event) => {
        handlers.onDragStart(item, event);
      }}
      onMouseEnter={() => {
        handlers.onHoverSkill(skill);
      }}
      {...dropTargetProps(target, handlers)}
    >
      <img src={iconUrl(skill)} alt="" draggable={false} />
      <span className="slot-name">{skill.name}</span>
      <RemoveButton
        label={`Unslot ${skill.name}`}
        onClick={() => {
          handlers.onRemove(item);
        }}
      />
      <span className="rank-badge">
        {build.rank(skill)}/{MAX_RANK}
      </span>
      {accepts}
    </div>
  );
}

// Coloured segments show which trees the extra slots take under the slotted mutation.
function AcceptedTrees({ build }: { build: Build }): JSX.Element | null {
  const trees = build.extraSlotTrees();
  if (trees.length === 0) return null;
  return (
    <span className="slot-accepts" title={`Accepts: ${trees.join(', ')}`}>
      {trees.map((tree) => (
        <i key={tree} style={{ background: treeColour(tree) }} />
      ))}
    </span>
  );
}

function MutagenSlot({ group, build, handlers }: SlotProps & { group: number }): JSX.Element {
  const [cx, cy] = MUTAGEN_SLOT_CENTRES[group] ?? [0, 0];
  const target: DropTarget = { kind: 'mutagen-slot', group };
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const half = MUTAGEN_SLOT_SIZE / 2;
  const position = { left: cx - half, top: cy - half };
  const bonus = build.mutagenBonus(group);

  if (bonus === null) {
    return (
      <div
        className={`mutagen-slot${over}`}
        style={position}
        {...dropTargetProps(target, handlers)}
      />
    );
  }

  const { mutagen, matching, synergy, value } = bonus;
  const item: DragItem = { kind: 'mutagen', mutagen: mutagen.id, from: group };
  const details = [
    plural(matching, `matching ${mutagen.tree} skill`),
    synergy > 0 ? `Synergy ${synergy}` : '',
  ]
    .filter((part) => part !== '')
    .join(', ');
  return (
    <>
      <div
        className={`mutagen-slot filled${over}`}
        style={{ ...position, background: mutagenColour(mutagen) }}
        draggable
        onDragStart={(event) => {
          handlers.onDragStart(item, event);
        }}
        onMouseEnter={() => {
          handlers.onHoverMutagen(mutagen);
        }}
        {...dropTargetProps(target, handlers)}
      >
        <span className="mutagen-name">{mutagenLabel(mutagen)}</span>
        <RemoveButton
          label={`Remove ${mutagen.name}`}
          onClick={() => {
            handlers.onRemove(item);
          }}
        />
      </div>
      <div
        className="mutagen-bonus"
        style={{
          left: cx - 60,
          top: cy + MUTAGEN_SLOT_SIZE / Math.SQRT2 + 4,
          color: mutagenColour(mutagen),
        }}
      >
        {mutagenEffect(mutagen, value)}
        <br />
        <span>{details}</span>
      </div>
    </>
  );
}

function MutationSlot({ catalog, build, handlers }: SlotProps & { catalog: Catalog }): JSX.Element {
  const [x, y] = MUTATION_SLOT_POSITION;
  const target: DropTarget = { kind: 'mutation-slot' };
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const mutation = catalog.mutation(build.slottedMutation);

  if (mutation === undefined) {
    return (
      <div
        className={`mutation-slot${over}`}
        style={{ left: x, top: y }}
        {...dropTargetProps(target, handlers)}
      >
        Mutation
        <br />({build.researchedCount} researched)
      </div>
    );
  }

  const item: DragItem = { kind: 'mutation', mutation: mutation.id, fromBoard: true };
  return (
    <div
      className={`mutation-slot filled${over}`}
      style={{ left: x, top: y, background: mutationColour(mutation) }}
      draggable
      onDragStart={(event) => {
        handlers.onDragStart(item, event);
      }}
      onMouseEnter={() => {
        handlers.onHoverMutation(mutation);
      }}
      {...dropTargetProps(target, handlers)}
    >
      {mutation.name}
      <RemoveButton
        label={`Remove ${mutation.name}`}
        onClick={() => {
          handlers.onRemove(item);
        }}
      />
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }): JSX.Element {
  return (
    <button type="button" className="remove" title={label} aria-label={label} onClick={onClick}>
      ✕
    </button>
  );
}
