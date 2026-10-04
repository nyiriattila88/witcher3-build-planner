import type { JSX } from 'react';
import { BASE_SLOTS, slotGroup, type BuildView } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import { iconUrl } from './asset-urls';
import { boardItemProps, type SlotProps } from './board-item';
import { mutagenColour, treeColour } from './colours';
import { dropTargetKey, type DropTarget } from './drag-and-drop';
import { SLOT_SIZE, slotCentre } from './geometry';
import { RankPips } from './rank-pips';
import { useBoardTaps } from './use-board-taps';

// A skill slot of the board: locked until research opens it, empty, or holding a skill.
export function SkillSlot({
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
  const mutagen = index < BASE_SLOTS ? build.mutagenBonus(slotGroup(index))?.mutagen : undefined;
  if (skill === null) {
    return (
      <div
        className={`slot${over}`}
        style={position}
        role="button"
        tabIndex={0}
        aria-label="Empty skill slot, click to pick a skill"
        onClick={() => {
          onPick(target);
        }}
        onKeyDown={taps.onKeyDown}
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
      role="button"
      tabIndex={0}
      aria-label={`${skill.name} in slot ${index + 1}`}
      onMouseEnter={() => {
        onTip(index);
        handlers.onHoverSkill(skill);
      }}
      onMouseLeave={() => {
        onTip(null);
      }}
      onFocus={() => {
        onTip(index);
        handlers.onHoverSkill(skill);
      }}
      onBlur={() => {
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
function AcceptedTrees({ build }: { build: BuildView }): JSX.Element | null {
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
