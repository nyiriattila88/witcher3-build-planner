import type { DragEvent, JSX, KeyboardEvent } from 'react';
import { MAX_RANK, type Build } from '../build/build';
import type { Skill, SkillTree } from '../catalog/catalog';
import { backgroundUrl, iconUrl, treeColour } from './appearance';
import type { DragItem } from './drag-and-drop';
import { ICON_SIZE, NODE_WIDTH, nodeCentre, treeBackdrop, treePaneSize } from './geometry';

type TreePaneProps = {
  readonly tree: SkillTree;
  readonly build: Build;
  readonly onLearn: (skill: Skill) => void;
  readonly onUnlearn: (skill: Skill) => void;
  readonly onHover: (skill: Skill) => void;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
};

export function TreePane({ tree, build, ...handlers }: TreePaneProps): JSX.Element {
  const size = treePaneSize(tree.skills.map((skill) => skill.position));
  return (
    <div
      className="pane-content"
      style={{
        ...size,
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
        <SkillNode key={skill.index} skill={skill} build={build} {...handlers} />
      ))}
    </div>
  );
}

type SkillNodeProps = Omit<TreePaneProps, 'tree'> & { readonly skill: Skill };

function SkillNode({
  skill,
  build,
  onLearn,
  onUnlearn,
  onHover,
  onDragStart,
}: SkillNodeProps): JSX.Element {
  const rank = build.rank(skill);
  const [x, y] = nodeCentre(skill.position);
  const state = rank > 0 ? 'learned' : build.isAvailable(skill) ? 'available' : 'locked';
  const slotted = build.slotOf(skill) >= 0 ? ' slotted' : '';

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') onLearn(skill);
    else if (event.key === 'Delete' || event.key === 'Backspace') onUnlearn(skill);
    else return;
    event.preventDefault();
  };

  return (
    <div
      className={`node ${state}${slotted}`}
      style={{ left: x - NODE_WIDTH / 2, top: y - ICON_SIZE / 2 }}
      role="button"
      tabIndex={0}
      aria-label={`${skill.name}, rank ${rank} of ${MAX_RANK}`}
      draggable={rank > 0}
      onClick={() => {
        onLearn(skill);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        onUnlearn(skill);
      }}
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        onHover(skill);
      }}
      onFocus={() => {
        onHover(skill);
      }}
      onDragStart={(event) => {
        onDragStart({ kind: 'skill', skill, from: null }, event);
      }}
    >
      <div className="node-icon" style={{ background: treeColour(skill.tree) }}>
        <img src={iconUrl(skill)} alt="" draggable={false} />
        <span className="rank-badge">
          {rank}/{MAX_RANK}
        </span>
      </div>
      {skill.name}
    </div>
  );
}
