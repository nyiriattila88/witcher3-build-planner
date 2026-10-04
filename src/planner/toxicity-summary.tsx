import type { JSX } from 'react';
import { ACQUIRED_TOLERANCE, METABOLIC_CONTROL, type Build, type BuildView } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import {
  ALCHEMY_RECIPES,
  BASE_MAX_TOXICITY,
  MANTICORE_ARMOR,
  SAFE_TOXICITY_SHARE,
} from '../data/alchemy';
import type { KeySkill } from '../data/skills';
import type { ToxicityTips } from './elixir-tile';

type ToxicitySummaryProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly tips: ToxicityTips;
};

const formatAmount = (value: number): string =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

// What the meter warns about, the worse case first.
const toxicityWarning = (toxicity: number, max: number, overdose: number): string | null => {
  if (toxicity > max) return 'Above the maximum: take something off';
  if (toxicity > overdose) return 'Overdose: Vitality drains';
  return null;
};

// The active Toxicity against the maximum, and where the maximum comes from.
export function ToxicitySummary({
  catalog,
  build,
  onChange,
  tips,
}: ToxicitySummaryProps): JSX.Element {
  const max = build.maxToxicity();
  const toxicity = build.toxicityPlan.toxicity();
  const overdose = build.overdoseToxicity();
  const over = toxicity > overdose;
  const warning = toxicityWarning(toxicity, max, overdose);
  const percent = Math.round((toxicity / max) * 100);
  const share = (value: number): string => `${Math.min(100, (value / max) * 100)}%`;
  // Skills that start to work at a share of the maximum are marked on the bar while slotted.
  const marks = build.toxicityThresholds();

  return (
    <section className="toxicity-summary">
      <div className="toxicity-meter">
        <div
          className="toxicity-bar"
          role="meter"
          aria-label="Active Toxicity"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={toxicity}
        >
          <span
            className={over ? 'toxicity-fill overdosed' : 'toxicity-fill'}
            style={{ width: share(toxicity) }}
          />
          <span
            className="toxicity-mark overdose"
            style={{ left: share(overdose) }}
            title={`Overdose above ${formatAmount(overdose)}`}
          />
          {marks.map((mark) => (
            <span
              key={mark.skill.name}
              className="toxicity-mark skill"
              style={{ left: share(mark.toxicity) }}
              onMouseEnter={(event) => {
                tips.showSkill(
                  event,
                  mark.skill,
                  `Marked at ${formatAmount(mark.toxicity)} Toxicity`,
                );
              }}
              onMouseLeave={tips.hide}
            />
          ))}
        </div>
        <span className={over ? 'toxicity-percent overdosed' : 'toxicity-percent'}>{percent}%</span>
      </div>
      <p className="toxicity-line">
        Active <b>{toxicity}</b> of <b>{max}</b> Toxicity ({percent}%), overdose above{' '}
        <b>{formatAmount(overdose)}</b> ({Math.round(SAFE_TOXICITY_SHARE * 100)}%)
        {warning !== null && <span className="toxicity-warning"> {warning}</span>}
      </p>
      <dl className="toxicity-sources">
        <div>
          <dt>Base</dt>
          <dd>{BASE_MAX_TOXICITY}</dd>
        </div>
        <SkillSource
          catalog={catalog}
          build={build}
          source={ACQUIRED_TOLERANCE}
          value={build.acquiredTolerance()}
          tips={tips}
        />
        <SkillSource
          catalog={catalog}
          build={build}
          source={METABOLIC_CONTROL}
          value={build.metabolicControl()}
          tips={tips}
        />
        <div>
          <dt>Manticore armor</dt>
          <dd>
            +{build.manticorePieces * MANTICORE_ARMOR.toxicity} ({build.manticorePieces} of{' '}
            {MANTICORE_ARMOR.pieces} pieces)
          </dd>
        </div>
      </dl>
      <div className="toxicity-controls">
        <label>
          Known recipes{' '}
          <input
            type="number"
            min={0}
            max={ALCHEMY_RECIPES}
            value={build.toxicityPlan.knownRecipes}
            onChange={(event) => {
              const count = Number(event.target.value);
              onChange((draft) => {
                draft.toxicityPlan.setKnownRecipes(count);
              });
            }}
          />{' '}
          of {ALCHEMY_RECIPES}
        </label>
        <span>Manticore armor pieces come from the Gear tab.</span>
      </div>
    </section>
  );
}

// A skill that adds to maximum Toxicity, which only counts while it sits in a slot.
function SkillSource({
  catalog,
  build,
  source,
  value,
  tips,
}: {
  catalog: Catalog;
  build: BuildView;
  source: { readonly skill: KeySkill };
  value: number;
  tips: ToxicityTips;
}): JSX.Element {
  const skill = catalog.keySkills[source.skill];
  const rank = build.slottedRank(skill);
  return (
    <div
      className="skill"
      onMouseEnter={(event) => {
        tips.showSkill(event, skill, rank > 0 ? undefined : 'Counts only while it sits in a slot');
      }}
      onMouseLeave={tips.hide}
    >
      <dt>{skill.name}</dt>
      <dd>{rank > 0 ? `+${value} (rank ${rank})` : 'not slotted'}</dd>
    </div>
  );
}
