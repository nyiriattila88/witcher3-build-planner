import { useRef, useState, type CSSProperties, type JSX, type MouseEvent } from 'react';
import { ACQUIRED_TOLERANCE, METABOLIC_CONTROL, type Build } from '../build/build';
import type { Catalog, Skill } from '../catalog/catalog';
import {
  ALCHEMY_RECIPES,
  BASE_MAX_TOXICITY,
  MANTICORE_ARMOR,
  type DecoctionData,
  type PotionData,
} from '../data/alchemy';
import { decoctionIconUrl, formatDuration, potionIconUrl, potionTierName } from './appearance';
import { PANE_WIDTH } from './geometry';
import { SkillTooltip } from './skill-tooltip';

type ToxicityPlannerProps = {
  readonly catalog: Catalog;
  readonly build: Build;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onHoverPotion: (potion: PotionData, tier: number) => void;
  readonly onHoverDecoction: (decoction: DecoctionData) => void;
  readonly onHoverSkill: (skill: Skill) => void;
};

type Elixir = PotionData['tiers'][number];

type Tip = { readonly placement: CSSProperties } & (
  | {
      readonly kind: 'elixir';
      readonly title: string;
      readonly elixir: Elixir;
      readonly hint: string;
    }
  | { readonly kind: 'skill'; readonly skill: Skill; readonly hint: string | undefined }
);

const TIER_LABELS = ['I', 'II', 'III'];
const MANTICORE_OPTIONS = Array.from({ length: MANTICORE_ARMOR.pieces + 1 }, (_, n) => n);
const TIP_GAP = 10;

// Skills whose effect starts at a share of the maximum, marked on the bar while they sit in a slot.
const SKILL_THRESHOLDS = [
  { tree: 'Alchemy', name: 'Delayed Recovery', shares: [0.7, 0.65, 0.6] },
  { tree: 'Alchemy', name: 'High Tolerance', shares: [0.8, 0.8, 0.8] },
] as const;

const formatAmount = (value: number): string =>
  Number.isInteger(value) ? `${value}` : value.toFixed(1);

export function ToxicityPlanner({
  catalog,
  build,
  onChange,
  onHoverPotion,
  onHoverDecoction,
  onHoverSkill,
}: ToxicityPlannerProps): JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const max = build.maxToxicity();
  const toxicity = build.toxicity();
  const overdose = build.overdoseToxicity();
  const over = toxicity > overdose;
  const percent = Math.round((toxicity / max) * 100);
  const share = (value: number): string => `${Math.min(100, (value / max) * 100)}%`;
  const slottedRank = (skill: Skill | undefined): number =>
    skill !== undefined && build.slotOf(skill) >= 0 ? build.rank(skill) : 0;
  const marks = SKILL_THRESHOLDS.flatMap(({ tree, name, shares }) => {
    const skill = catalog.skill(tree, name);
    const at = shares[slottedRank(skill) - 1];
    return skill === undefined || at === undefined ? [] : [{ skill, value: max * at }];
  });

  // The in-game tooltip, beside what is under the pointer and towards the middle of the pane, as on
  // the board.
  const placeBeside = (target: Element | null): CSSProperties | null => {
    const pane = root.current?.getBoundingClientRect();
    const box = target?.getBoundingClientRect();
    if (pane === undefined || box === undefined) return null;
    const left = box.left - pane.left;
    const top = box.top - pane.top;
    const horizontal =
      left + box.width / 2 > pane.width / 2
        ? { right: pane.width - left + TIP_GAP }
        : { left: left + box.width + TIP_GAP };
    const vertical =
      top + box.height / 2 > pane.height / 2
        ? { bottom: pane.height - (top + box.height) }
        : { top };
    return { ...horizontal, ...vertical };
  };
  const showTip = (event: MouseEvent, title: string, elixir: Elixir, hint: string): void => {
    const placement = placeBeside(event.currentTarget.closest('.elixir'));
    if (placement !== null) setTip({ kind: 'elixir', title, elixir, hint, placement });
  };
  const showSkillTip = (event: MouseEvent, skill: Skill, hint?: string): void => {
    onHoverSkill(skill);
    const placement = placeBeside(event.currentTarget);
    if (placement !== null) setTip({ kind: 'skill', skill, hint, placement });
  };
  const hideTip = (): void => {
    setTip(null);
  };

  // A skill that adds to maximum Toxicity, which only counts while it sits in a slot.
  const skillSource = (
    source: { readonly tree: string; readonly name: string },
    value: number,
  ): JSX.Element => {
    const skill = catalog.skill(source.tree, source.name);
    const rank = slottedRank(skill);
    return (
      <div
        className="skill"
        onMouseEnter={(event) => {
          if (skill !== undefined)
            showSkillTip(
              event,
              skill,
              rank > 0 ? undefined : 'Counts only while it sits in a slot',
            );
        }}
        onMouseLeave={hideTip}
      >
        <dt>{source.name}</dt>
        <dd>{rank > 0 ? `+${value} (rank ${rank})` : 'not slotted'}</dd>
      </div>
    );
  };

  return (
    <div ref={root} className="pane-content toxicity" style={{ width: PANE_WIDTH }}>
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
            {marks.map(({ skill, value }) => (
              <span
                key={skill.name}
                className="toxicity-mark skill"
                style={{ left: share(value) }}
                onMouseEnter={(event) => {
                  showSkillTip(event, skill, `Marked at ${formatAmount(value)} Toxicity`);
                }}
                onMouseLeave={hideTip}
              />
            ))}
          </div>
          <span className={over ? 'toxicity-percent overdosed' : 'toxicity-percent'}>
            {percent}%
          </span>
        </div>
        <p className="toxicity-line">
          Active <b>{toxicity}</b> of <b>{max}</b> Toxicity ({percent}%), overdose above{' '}
          <b>{formatAmount(overdose)}</b> (50%)
          {over && <span className="toxicity-warning"> Overdose: Vitality drains</span>}
        </p>
        <dl className="toxicity-sources">
          <div>
            <dt>Base</dt>
            <dd>{BASE_MAX_TOXICITY}</dd>
          </div>
          {skillSource(ACQUIRED_TOLERANCE, build.acquiredTolerance())}
          {skillSource(METABOLIC_CONTROL, build.metabolicControl())}
          <div>
            <dt>Manticore armor</dt>
            <dd>+{build.manticorePieces * MANTICORE_ARMOR.toxicity}</dd>
          </div>
        </dl>
        <div className="toxicity-controls">
          <label>
            Known recipes{' '}
            <input
              type="number"
              min={0}
              max={ALCHEMY_RECIPES}
              value={build.knownRecipes}
              onChange={(event) => {
                const count = Number(event.target.value);
                onChange((draft) => {
                  draft.setKnownRecipes(count);
                });
              }}
            />{' '}
            of {ALCHEMY_RECIPES}
          </label>
          <span className="manticore-pieces">
            Manticore armor pieces
            {MANTICORE_OPTIONS.map((pieces) => (
              <button
                key={pieces}
                type="button"
                className={pieces === build.manticorePieces ? 'active' : undefined}
                aria-pressed={pieces === build.manticorePieces}
                onClick={() => {
                  onChange((draft) => {
                    draft.setManticorePieces(pieces);
                  });
                }}
              >
                {pieces}
              </button>
            ))}
          </span>
        </div>
      </section>

      <h3 className="elixir-heading">Decoctions</h3>
      <div className="elixir-grid">
        {catalog.decoctions.map((decoction) => {
          const active = build.isDecoctionActive(decoction);
          const hint = active ? 'Click to take it off' : 'Click to make it active';
          return (
            <button
              key={decoction.name}
              type="button"
              className={active ? 'elixir active' : 'elixir'}
              aria-pressed={active}
              onClick={(event) => {
                onChange((draft) => {
                  draft.setDecoctionActive(decoction, !active);
                });
                showTip(
                  event,
                  decoction.name,
                  decoction,
                  active ? 'Click to make it active' : 'Click to take it off',
                );
              }}
              onMouseEnter={(event) => {
                onHoverDecoction(decoction);
                showTip(event, decoction.name, decoction, hint);
              }}
              onMouseLeave={hideTip}
              onFocus={() => {
                onHoverDecoction(decoction);
              }}
            >
              <img src={decoctionIconUrl(decoction)} alt="" draggable={false} />
              <span className="elixir-name">{decoction.name.replace(/ decoction$/, '')}</span>
              <span className="elixir-meta">
                {decoction.toxicity} · {formatDuration(decoction.duration)}
              </span>
            </button>
          );
        })}
      </div>

      <h3 className="elixir-heading">Potions</h3>
      <div className="elixir-grid">
        {catalog.potions.map((potion) => {
          const tier = build.potionTier(potion);
          const shown = potion.tiers[Math.max(0, tier - 1)] ?? potion.tiers[0];
          const shownTier = Math.max(1, tier);
          const hint =
            potion.tiers.length === 1
              ? 'Click On to make it active'
              : 'Pick I, II or III to make one active';
          return (
            <div
              key={potion.name}
              className={tier > 0 ? 'elixir active' : 'elixir'}
              onMouseEnter={(event) => {
                onHoverPotion(potion, shownTier);
                showTip(event, potionTierName(potion, shownTier), shown, hint);
              }}
              onMouseLeave={hideTip}
            >
              <img src={potionIconUrl(potion)} alt="" draggable={false} />
              <span className="elixir-name">{potion.name}</span>
              <span className="elixir-meta">
                {shown.toxicity} · {formatDuration(shown.duration)}
              </span>
              <span className="elixir-tiers">
                {potion.tiers.map((each, i) => {
                  const chosen = tier === i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={chosen ? 'active' : undefined}
                      aria-pressed={chosen}
                      aria-label={potionTierName(potion, i + 1)}
                      onClick={() => {
                        onChange((draft) => {
                          draft.setPotionTier(potion, chosen ? 0 : i + 1);
                        });
                      }}
                      onMouseEnter={(event) => {
                        onHoverPotion(potion, i + 1);
                        showTip(
                          event,
                          potionTierName(potion, i + 1),
                          each,
                          chosen ? 'Click to take it off' : 'Click to make this one active',
                        );
                      }}
                      onFocus={() => {
                        onHoverPotion(potion, i + 1);
                      }}
                    >
                      {potion.tiers.length === 1 ? 'On' : TIER_LABELS[i]}
                    </button>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>

      {tip?.kind === 'skill' && (
        <SkillTooltip
          skill={tip.skill}
          rank={build.rank(tip.skill)}
          placement={tip.placement}
          hint={tip.hint}
        />
      )}
      {tip?.kind === 'elixir' && (
        <div className="game-tooltip" style={tip.placement} role="tooltip">
          <div className="game-tooltip-head">
            <b>{tip.title}</b>
            <span>
              Toxicity {tip.elixir.toxicity} · {formatDuration(tip.elixir.duration)}
            </span>
          </div>
          <p className="game-tooltip-label">{tip.elixir.effect}</p>
          <p className="game-tooltip-hint">{tip.hint}</p>
        </div>
      )}
    </div>
  );
}
