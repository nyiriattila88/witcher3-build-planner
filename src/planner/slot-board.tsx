import { useState, type JSX, type RefObject } from 'react';
import { MUTAGEN_GROUPS, type Build } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import { helixUrl } from './appearance';
import { REMOVE_TIP, type BoardHandlers } from './board-item';
import { dropTargetKey, type DropTarget } from './drag-and-drop';
import { FitToWidth } from './fit-to-width';
import { BOARD_SIZE, SLOT_SIZE, slotCentre, tooltipPlacement } from './geometry';
import { MutagenSlot } from './mutagen-slot';
import { MutationSlot } from './mutation-slot';
import { SkillSlot } from './skill-slot';
import { SkillTooltip } from './skill-tooltip';
import { SlotChoices } from './slot-choices';
import { GroupBracket, GroupHeader } from './slot-group';

type SlotBoardProps = BoardHandlers & {
  readonly catalog: Catalog;
  readonly build: Build;
  // Drops are measured against the board, see useDragAndDrop.
  readonly boardRef: RefObject<HTMLDivElement | null>;
};

const groups = Array.from({ length: MUTAGEN_GROUPS }, (_, group) => group);

// The in-game character screen: the skill slots in four groups around the mutation, each group
// with its mutagen, and under it the list of what a picked slot can take.
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
                mutagen={build.mutagenBonus(group)?.mutagen}
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
