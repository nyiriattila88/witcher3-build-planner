import { useState, type DragEvent, type JSX, type RefObject } from 'react';
import { BASE_SLOTS, MUTAGEN_GROUPS, SLOTS_PER_GROUP, slotGroup, type Build } from '../build/build';
import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import { helixUrl, iconUrl, mutagenColour, mutagenIconUrl, treeColour } from './appearance';
import { dropTargetKey, type DragItem, type DropTarget } from './drag-and-drop';
import {
  BOARD_CENTRE,
  BOARD_SIZE,
  MUTAGEN_SLOT_SIZE,
  MUTATION_SLOT_RADIUS,
  SLOT_SIZE,
  bracketX,
  groupHeaderBox,
  isRightGroup,
  mutagenSlotCentre,
  slotCentre,
  tooltipPlacement,
} from './geometry';
import { MutagenGem } from './mutagen-gem';
import { MutationDisc } from './mutation-disc';
import { RankPips } from './rank-pips';
import { SkillTooltip } from './skill-tooltip';

type BoardHandlers = {
  readonly overKey: string | null;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
  readonly onRemove: (item: DragItem) => void;
  readonly onHoverSkill: (skill: Skill) => void;
  readonly onHoverMutagen: (mutagen: Mutagen) => void;
  readonly onHoverMutation: (mutation: Mutation) => void;
};

type SlotBoardProps = BoardHandlers & {
  readonly catalog: Catalog;
  readonly build: Build;
  // Drops are measured against the board, see useDragAndDrop.
  readonly boardRef: RefObject<HTMLDivElement | null>;
};

const groups = Array.from({ length: MUTAGEN_GROUPS }, (_, group) => group);

const REMOVE_TIP = 'Drag to move, double-click to remove';

// Props of a board item: dragging moves it, a double click takes it off the board.
const boardItemProps = (item: DragItem, handlers: BoardHandlers, onPickUp?: () => void) => ({
  draggable: true,
  onDragStart: (event: DragEvent) => {
    onPickUp?.();
    handlers.onDragStart(item, event);
  },
  onDoubleClick: () => {
    handlers.onRemove(item);
  },
});

export function SlotBoard({ catalog, build, boardRef, ...handlers }: SlotBoardProps): JSX.Element {
  const [tipSlot, setTipSlot] = useState<number | null>(null);
  const tipSkill = tipSlot === null ? null : build.slotAt(tipSlot);
  return (
    <div ref={boardRef} className="board" style={BOARD_SIZE}>
      <img className="board-helix" src={helixUrl} alt="" draggable={false} />
      <svg width={BOARD_SIZE.width} height={BOARD_SIZE.height}>
        {groups.map((group) => (
          <GroupBracket
            key={group}
            group={group}
            build={build}
            mutagen={catalog.mutagen(build.mutagenAt(group))}
          />
        ))}
      </svg>
      {groups.map((group) => (
        <GroupHeader key={group} group={group} build={build} />
      ))}
      {Array.from({ length: build.slotCount }, (_, index) => (
        <SkillSlot
          key={index}
          index={index}
          catalog={catalog}
          build={build}
          handlers={handlers}
          onTip={setTipSlot}
        />
      ))}
      {groups.map((group) => (
        <MutagenSlot key={group} group={group} build={build} handlers={handlers} />
      ))}
      <MutationSlot catalog={catalog} build={build} handlers={handlers} />
      {tipSlot !== null && tipSkill !== null && (
        <SkillTooltip
          skill={tipSkill}
          rank={build.rank(tipSkill)}
          placement={tooltipPlacement(slotCentre(tipSlot), SLOT_SIZE / 2, BOARD_SIZE)}
          hint={REMOVE_TIP}
        />
      )}
    </div>
  );
}

// The bracket joins a group's three slots to its mutagen. The way from each slot that matches the
// mutagen takes the mutagen's colour, the rest of the bracket stays grey.
function GroupBracket({
  group,
  build,
  mutagen,
}: {
  group: number;
  build: Build;
  mutagen: Mutagen | undefined;
}): JSX.Element {
  const side = isRightGroup(group) ? 1 : -1;
  const first = group * SLOTS_PER_GROUP;
  const [top = 0, middle = 0, bottom = 0] = [0, 1, 2].map((i) => slotCentre(first + i)[1]);
  const edge = slotCentre(first)[0] + (side * SLOT_SIZE) / 2;
  const spine = bracketX(group);
  // The diamond's corner that faces the slots.
  const corner = mutagenSlotCentre(group)[0] - (side * MUTAGEN_SLOT_SIZE) / Math.SQRT2;
  const [topMatches = false, middleMatches = false, bottomMatches = false] = [0, 1, 2].map(
    (i) => mutagen !== undefined && build.slotMatchesMutagen(first + i),
  );
  const segments: readonly (readonly [path: string, matches: boolean])[] = [
    [`M${edge} ${top} H${spine} V${middle}`, topMatches],
    [`M${edge} ${bottom} H${spine} V${middle}`, bottomMatches],
    [`M${edge} ${middle} H${spine}`, middleMatches],
    [`M${spine} ${middle} H${corner}`, topMatches || middleMatches || bottomMatches],
  ];
  const lit = segments.filter(([, matches]) => matches).map(([path]) => path);
  return (
    <>
      <path className="bracket" d={segments.map(([path]) => path).join(' ')} />
      {mutagen !== undefined && lit.length > 0 && (
        <path
          className="bracket filled"
          style={{ stroke: mutagenColour(mutagen) }}
          d={lit.join(' ')}
        />
      )}
    </>
  );
}

// The bar over a group, with its mutagen bonus as the game shows it.
function GroupHeader({ group, build }: { group: number; build: Build }): JSX.Element {
  const right = isRightGroup(group);
  const box = groupHeaderBox(group);
  const bonus = build.mutagenBonus(group);
  const side = right ? ' right' : '';

  if (bonus === null) {
    return (
      <div className={`group-header empty${side}`} style={box}>
        No mutagen
      </div>
    );
  }

  const { mutagen, value } = bonus;
  const icon = <img src={mutagenIconUrl(mutagen)} alt="" draggable={false} />;
  const effect = (
    <span className="group-effect">
      {mutagen.effect}{' '}
      <b>
        +{value}
        {mutagen.unit}
      </b>
    </span>
  );
  return (
    <div className={`group-header${side}`} style={{ ...box, color: mutagenColour(mutagen) }}>
      {right ? (
        <>
          {effect}
          {icon}
        </>
      ) : (
        <>
          {icon}
          {effect}
        </>
      )}
    </div>
  );
}

type SlotProps = { readonly build: Build; readonly handlers: BoardHandlers };

function SkillSlot({
  index,
  catalog,
  build,
  handlers,
  onTip,
}: SlotProps & {
  index: number;
  catalog: Catalog;
  onTip: (index: number | null) => void;
}): JSX.Element {
  const [x, y] = slotCentre(index);
  const target: DropTarget = { kind: 'slot', index };
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const position = { left: x - SLOT_SIZE / 2, top: y - SLOT_SIZE / 2 };

  if (!build.isSlotUnlocked(index)) {
    const needed = catalog.extraSlotUnlocks[index - BASE_SLOTS] ?? 0;
    return (
      <div
        className="slot locked"
        style={position}
        title={`Unlocks at ${needed} researched mutations`}
        aria-label={`Locked slot, unlocks at ${needed} researched mutations`}
      >
        <LockIcon />
      </div>
    );
  }

  const accepts = index >= BASE_SLOTS ? <AcceptedTrees build={build} /> : null;
  const mutagen =
    index < BASE_SLOTS ? catalog.mutagen(build.mutagenAt(slotGroup(index))) : undefined;
  const skill = build.slotAt(index);
  if (skill === null) {
    return (
      <div className={`slot${over}`} style={position}>
        {accepts}
      </div>
    );
  }

  // A skill matching its group's mutagen glows, since it raises the bonus.
  const glow =
    mutagen !== undefined && build.slotMatchesMutagen(index)
      ? { boxShadow: `0 0 0 2px ${mutagenColour(mutagen)}, 0 0 16px ${mutagenColour(mutagen)}` }
      : {};
  return (
    <div
      className={`slot filled${over}`}
      style={{ ...position, color: treeColour(skill.tree) }}
      aria-label={`${skill.name} in slot ${index + 1}`}
      onMouseEnter={() => {
        onTip(index);
        handlers.onHoverSkill(skill);
      }}
      onMouseLeave={() => {
        onTip(null);
      }}
      {...boardItemProps({ kind: 'skill', skill, from: index }, handlers, () => {
        onTip(null);
      })}
    >
      <span className="tile" style={glow}>
        <img src={iconUrl(skill)} alt="" draggable={false} />
        {accepts}
      </span>
      <RankPips rank={build.rank(skill)} />
    </div>
  );
}

// Coloured segments along the bottom of slots 13-16 show which trees they take.
function AcceptedTrees({ build }: { build: Build }): JSX.Element | null {
  const trees = build.extraSlotTrees();
  if (trees.length === 0) return null;
  return (
    <span className="slot-accepts" title={`Takes ${trees.join(', ')} skills`}>
      {trees.map((tree) => (
        <i key={tree} style={{ background: treeColour(tree) }} />
      ))}
    </span>
  );
}

function MutagenSlot({ group, build, handlers }: SlotProps & { group: number }): JSX.Element {
  const [cx, cy] = mutagenSlotCentre(group);
  const target: DropTarget = { kind: 'mutagen-slot', group };
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const half = MUTAGEN_SLOT_SIZE / 2;
  const position = { left: cx - half, top: cy - half };
  const bonus = build.mutagenBonus(group);

  if (bonus === null) {
    return (
      <div className={`mutagen-slot${over}`} style={position} aria-label="Empty mutagen slot" />
    );
  }

  const { mutagen, matching, synergy } = bonus;
  return (
    <>
      <div
        className={`mutagen-slot filled${over}`}
        style={position}
        title={REMOVE_TIP}
        aria-label={mutagen.name}
        onMouseEnter={() => {
          handlers.onHoverMutagen(mutagen);
        }}
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

// The mutation sits in the middle, its name to the left and what it does to the right.
function MutationSlot({ catalog, build, handlers }: SlotProps & { catalog: Catalog }): JSX.Element {
  const [cx, cy] = BOARD_CENTRE;
  const radius = MUTATION_SLOT_RADIUS;
  const target: DropTarget = { kind: 'mutation-slot' };
  const over = handlers.overKey === dropTargetKey(target) ? ' over' : '';
  const mutation = catalog.mutation(build.slottedMutation);
  const innate = catalog.mutations.find((candidate) => candidate.innate);
  const circle = { left: cx - radius, top: cy - radius, width: 2 * radius, height: 2 * radius };
  const nameBox = { right: BOARD_SIZE.width - (cx - radius - 20), top: cy - 34 };
  const textBox = { left: cx + radius + 20, top: cy - 70 };

  if (mutation === undefined) {
    return (
      <>
        <div className={`mutation-slot${over}`} style={circle} aria-label="Empty mutation slot">
          {innate !== undefined && <MutationDisc mutation={innate} />}
        </div>
        <div className="mutation-title empty" style={nameBox}>
          <b>No mutation</b>
          <span>{build.researchedCount} researched</span>
        </div>
        <p className="mutation-text empty" style={textBox}>
          Drag a researched mutation onto the circle. Its colours decide which skills the four extra
          slots around it take.
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
        aria-label={mutation.name}
        onMouseEnter={() => {
          handlers.onHoverMutation(mutation);
        }}
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

function LockIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"
      />
    </svg>
  );
}
