import { useState, type DragEvent, type JSX } from 'react';
import { MAX_RANK, type BuildView } from '../build/build';
import type { Skill, SkillTree } from '../catalog/catalog';
import { backgroundUrl, iconUrl, treeColour } from './appearance';
import type { DragItem } from './drag-and-drop';
import { FitToWidth } from './fit-to-width';
import {
  ICON_SIZE,
  NODE_WIDTH,
  nodeCentre,
  tooltipPlacement,
  treeBackdrop,
  treePaneSize,
} from './geometry';
import { RankPips } from './rank-pips';
import { SkillTooltip } from './skill-tooltip';
import { useNodeControls } from './use-node-controls';

type TreePaneProps = {
  readonly tree: SkillTree;
  readonly build: BuildView;
  readonly onLearn: (skill: Skill) => void;
  readonly onUnlearn: (skill: Skill) => void;
  readonly onHover: (skill: Skill) => void;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
};

export function TreePane({
  tree,
  build,
  onHover,
  onDragStart,
  ...handlers
}: TreePaneProps): JSX.Element {
  const [hovered, setHovered] = useState<Skill | null>(null);
  const size = treePaneSize(tree.skills.map((skill) => skill.position));
  return (
    <FitToWidth width={size.width} height={size.height}>
      <div
        className="pane-content"
        style={{
          ...size,
          color: treeColour(tree.name),
          backgroundImage: `url("${backgroundUrl(tree.name.toLowerCase())}")`,
          backgroundSize: treeBackdrop.size,
          backgroundPosition: treeBackdrop.position,
        }}
      >
        <svg width={size.width} height={size.height}>
          {tree.links.map(([parent, child]) => {
            const [x1, y1] = nodeCentre(parent.position);
            const [x2, y2] = nodeCentre(child.position);
            return (
              <line
                key={`${parent.index}-${child.index}`}
                className={build.rank(parent) > 0 ? 'link active' : 'link'}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            );
          })}
        </svg>
        {tree.skills.map((skill) => (
          <SkillNode
            key={skill.index}
            skill={skill}
            build={build}
            {...handlers}
            onHover={(target) => {
              setHovered(target);
              onHover(target);
            }}
            onLeave={() => {
              setHovered(null);
            }}
            onDragStart={(item, event) => {
              setHovered(null);
              onDragStart(item, event);
            }}
          />
        ))}
        {hovered?.tree === tree.name && (
          <SkillTooltip
            skill={hovered}
            rank={build.rank(hovered)}
            placement={tooltipPlacement(nodeCentre(hovered.position), ICON_SIZE / 2, size)}
          />
        )}
      </div>
    </FitToWidth>
  );
}

type SkillNodeProps = Omit<TreePaneProps, 'tree'> & {
  readonly skill: Skill;
  readonly onLeave: () => void;
};

function SkillNode({
  skill,
  build,
  onLearn,
  onUnlearn,
  onHover,
  onLeave,
  onDragStart,
}: SkillNodeProps): JSX.Element {
  const rank = build.rank(skill);
  const [x, y] = nodeCentre(skill.position);
  const state = rank > 0 ? 'learned' : build.isAvailable(skill) ? 'available' : 'locked';
  const slotted = build.slotOf(skill) >= 0 ? ' slotted' : '';
  const controls = useNodeControls(
    () => {
      onLearn(skill);
    },
    () => {
      onUnlearn(skill);
    },
  );

  return (
    <div
      className={`node ${state}${slotted}`}
      style={{ left: x - NODE_WIDTH / 2, top: y - ICON_SIZE / 2 }}
      role="button"
      tabIndex={0}
      aria-label={`${skill.name}, rank ${rank} of ${MAX_RANK}`}
      draggable={rank > 0}
      {...controls}
      onMouseEnter={() => {
        onHover(skill);
      }}
      onMouseLeave={onLeave}
      onFocus={() => {
        onHover(skill);
      }}
      onBlur={onLeave}
      onDragStart={(event) => {
        onDragStart({ kind: 'skill', skill, from: null }, event);
      }}
    >
      <span
        className="node-icon tile"
        style={rank > 0 ? { color: treeColour(skill.tree) } : undefined}
      >
        <img src={iconUrl(skill)} alt="" draggable={false} />
      </span>
      <RankPips rank={rank} />
      <span className="node-name">{skill.name}</span>
    </div>
  );
}
