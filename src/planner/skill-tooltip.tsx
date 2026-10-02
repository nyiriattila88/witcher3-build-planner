import type { CSSProperties, JSX } from 'react';
import { MAX_RANK } from '../build/build';
import type { Skill } from '../catalog/catalog';

type SkillTooltipProps = {
  readonly skill: Skill;
  readonly rank: number;
  readonly placement: CSSProperties;
  // What the pointer can do with the skill there, shown under the levels.
  readonly hint?: string;
};

// The in-game tooltip of a skill: its current rank and the next one, beside the icon.
export function SkillTooltip({ skill, rank, placement, hint }: SkillTooltipProps): JSX.Element {
  const current = skill.ranks[rank - 1];
  const next = skill.ranks[rank];
  return (
    <div className="skill-tooltip" style={placement} role="tooltip">
      <div className="skill-tooltip-head">
        <b>{skill.name}</b>
        <span>
          {rank}/{MAX_RANK}
        </span>
      </div>
      {current !== undefined && (
        <>
          <p className="skill-tooltip-label">Current level:</p>
          <p>{current}</p>
        </>
      )}
      {next !== undefined && (
        <>
          <p className="skill-tooltip-label next">Next level:</p>
          <p className="next">{next}</p>
        </>
      )}
      {hint !== undefined && <p className="skill-tooltip-hint">{hint}</p>}
    </div>
  );
}
