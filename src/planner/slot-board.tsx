import { useState, type DragEvent, type JSX, type RefObject } from 'react';
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
  GROUP_NAMES,
  helixUrl,
  iconUrl,
  mutagenColour,
  mutagenIconUrl,
  mutationColour,
  treeColour,
} from './appearance';
import { acceptsDrop, dropTargetKey, type DragItem, type DropTarget } from './drag-and-drop';
import { FitToWidth } from './fit-to-width';
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
import { useBoardTaps } from './use-board-taps';

type BoardHandlers = {
  readonly overKey: string | null;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
  readonly onRemove: (item: DragItem) => void;
  // Puts what was picked from the list of a slot into it.
  readonly onPlace: (item: DragItem, target: DropTarget) => void;
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

const REMOVE_TIP = 'Drag to move, double-click to remove, click to change';

// Props of a board item: dragging moves it.
const boardItemProps = (item: DragItem, handlers: BoardHandlers, onPickUp?: () => void) => ({
  draggable: true,
  onDragStart: (event: DragEvent) => {
    onPickUp?.();
    handlers.onDragStart(item, event);
  },
});

export function SlotBoard({ catalog, build, boardRef, ...handlers }: SlotBoardProps): JSX.Element {
  const [tipSlot, setTipSlot] = useState<number | null>(null);
  const [picking, setPicking] = useState<DropTarget | null>(null);
  const tipSkill = tipSlot === null ? null : build.slotAt(tipSlot);
  return (
    <div className="board-area">
      <FitToWidth width={BOARD_SIZE.width} height={BOARD_SIZE.height}>
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
              onPick={setPicking}
              onTip={setTipSlot}
            />
          ))}
          {groups.map((group) => (
            <MutagenSlot
              key={group}
              group={group}
              build={build}
              handlers={handlers}
              onPick={setPicking}
            />
          ))}
          <MutationSlot catalog={catalog} build={build} handlers={handlers} onPick={setPicking} />
          {tipSlot !== null && tipSkill !== null && (
            <SkillTooltip
              skill={tipSkill}
              rank={build.rank(tipSkill)}
              placement={tooltipPlacement(slotCentre(tipSlot), SLOT_SIZE / 2, BOARD_SIZE)}
              hint={REMOVE_TIP}
            />
          )}
        </div>
      </FitToWidth>
      {picking !== null && (
        <SlotChoices
          key={dropTargetKey(picking)}
          catalog={catalog}
          build={build}
          target={picking}
          handlers={handlers}
          onClose={() => {
            setPicking(null);
          }}
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

type SlotProps = {
  readonly build: Build;
  readonly handlers: BoardHandlers;
  // Opens the list of what the slot can take.
  readonly onPick: (target: DropTarget) => void;
};

function SkillSlot({
  index,
  catalog,
  build,
  handlers,
  onPick,
  onTip,
}: SlotProps & {
  index: number;
  catalog: Catalog;
  onTip: (index: number | null) => void;
}): JSX.Element {
  const [x, y] = slotCentre(index);
  const target: DropTarget = { kind: 'slot', index };
  const skill = build.slotAt(index);
  const taps = useBoardTaps(
    () => {
      onPick(target);
    },
    () => {
      if (skill !== null) handlers.onRemove({ kind: 'skill', skill, from: index });
    },
  );
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
  if (skill === null) {
    return (
      <div
        className={`slot${over}`}
        style={position}
        role="button"
        aria-label="Empty skill slot, click to pick a skill"
        onClick={() => {
          onPick(target);
        }}
      >
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
      {...taps}
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

function MutagenSlot({
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
        aria-label="Empty mutagen slot, click to pick a mutagen"
        onClick={() => {
          onPick(target);
        }}
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
        aria-label={mutagen.name}
        onMouseEnter={() => {
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

// The mutation sits in the middle, its name to the left and what it does to the right.
function MutationSlot({
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
          aria-label="Empty mutation slot, click to pick a mutation"
          onClick={() => {
            onPick(target);
          }}
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
        aria-label={mutation.name}
        onMouseEnter={() => {
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

type SlotChoice = {
  readonly key: string;
  readonly label: string;
  readonly colour: string;
  readonly item: DragItem;
  readonly active: boolean;
};

type SlotChoiceList = {
  readonly title: string;
  // What the slot holds now, which emptying it takes off.
  readonly held: DragItem | null;
  readonly choices: readonly SlotChoice[];
  readonly none: string;
};

// What a slot can take, with the rules of a drop on it.
function choicesFor(catalog: Catalog, build: Build, target: DropTarget): SlotChoiceList {
  switch (target.kind) {
    case 'slot': {
      const current = build.slotAt(target.index);
      const group = GROUP_NAMES[slotGroup(target.index)] ?? '';
      return {
        title:
          target.index < BASE_SLOTS
            ? `Skill slot, ${group.toLowerCase()} group`
            : 'Extra skill slot',
        held: current === null ? null : { kind: 'skill', skill: current, from: target.index },
        choices: catalog.skills.flatMap((skill): SlotChoice[] => {
          const from = build.slotOf(skill);
          const item: DragItem = { kind: 'skill', skill, from: from < 0 ? null : from };
          if (!acceptsDrop(build, item, target)) return [];
          return [
            {
              key: `${skill.tree}/${skill.name}`,
              label: `${skill.name} ${build.rank(skill)}/${MAX_RANK}`,
              colour: treeColour(skill.tree),
              item,
              active: skill === current,
            },
          ];
        }),
        none: 'Learn a skill that fits this slot first.',
      };
    }
    case 'mutagen-slot': {
      const current = build.mutagenAt(target.group);
      const group = GROUP_NAMES[target.group] ?? '';
      return {
        title: `Mutagen slot, ${group.toLowerCase()} group`,
        held: current === null ? null : { kind: 'mutagen', mutagen: current, from: target.group },
        choices: catalog.mutagens.map((mutagen) => ({
          key: mutagen.id,
          label: mutagen.name,
          colour: mutagenColour(mutagen),
          item: { kind: 'mutagen', mutagen: mutagen.id, from: null },
          active: mutagen.id === current,
        })),
        none: '',
      };
    }
    case 'mutation-slot': {
      const current = build.slottedMutation;
      return {
        title: 'Mutation slot',
        held: current === null ? null : { kind: 'mutation', mutation: current, fromBoard: true },
        choices: catalog.mutations
          .filter((mutation) => build.canSlotMutation(mutation.id))
          .map((mutation) => ({
            key: mutation.id,
            label: mutation.name,
            colour: mutationColour(mutation),
            item: { kind: 'mutation', mutation: mutation.id, fromBoard: false },
            active: mutation.id === current,
          })),
        none: 'Research a mutation first.',
      };
    }
  }
}

// The list opens under the board, which on a phone is out of sight.
const bringIntoView = (element: HTMLElement | null): void => {
  element?.scrollIntoView({ block: 'nearest' });
};

// The list of what a slot can take, under the board. Picking from it works without dragging, as on a
// phone.
function SlotChoices({
  catalog,
  build,
  target,
  handlers,
  onClose,
}: {
  catalog: Catalog;
  build: Build;
  target: DropTarget;
  handlers: BoardHandlers;
  onClose: () => void;
}): JSX.Element {
  const { title, held, choices, none } = choicesFor(catalog, build, target);
  return (
    <section ref={bringIntoView} className="slot-choices" aria-label={title}>
      <div className="slot-choices-head">
        <b>{title}</b>
        <span>
          {held !== null && (
            <button
              type="button"
              onClick={() => {
                handlers.onRemove(held);
                onClose();
              }}
            >
              Empty it
            </button>
          )}
          <button type="button" onClick={onClose}>
            Close
          </button>
        </span>
      </div>
      {choices.length === 0 ? (
        <p className="slot-choices-none">{none}</p>
      ) : (
        <div className="slot-choices-list">
          {choices.map(({ key, label, colour, item, active }) => (
            <button
              key={key}
              type="button"
              className={active ? 'active' : undefined}
              style={{ borderLeftColor: colour }}
              aria-pressed={active}
              onClick={() => {
                handlers.onPlace(item, target);
                onClose();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </section>
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
