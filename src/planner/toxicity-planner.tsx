import { useRef, type JSX } from 'react';
import type { Build, BuildView } from '../build/build';
import type { Catalog, Skill } from '../catalog/catalog';
import type { DecoctionData, PotionData } from '../data/alchemy';
import { DecoctionGrid } from './decoction-grid';
import type { Elixir, ToxicityTips } from './elixir-tile';
import { formatDuration } from './game-text';
import { GameTooltip } from './game-tooltip';
import { PANE_WIDTH } from './geometry';
import { PotionGrid } from './potion-grid';
import { SkillTooltip } from './skill-tooltip';
import { ToxicitySummary } from './toxicity-summary';
import { usePaneTooltip } from './use-pane-tooltip';

type ToxicityPlannerProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onHoverPotion: (potion: PotionData, tier: number) => void;
  readonly onHoverDecoction: (decoction: DecoctionData) => void;
  readonly onHoverSkill: (skill: Skill) => void;
};

type Tip =
  | {
      readonly kind: 'elixir';
      readonly title: string;
      readonly elixir: Elixir;
      readonly hint: string;
    }
  | { readonly kind: 'skill'; readonly skill: Skill; readonly hint: string | undefined };

// The Toxicity tab: the meter and its sources, then the decoctions and potions to make active.
export function ToxicityPlanner({
  catalog,
  build,
  onChange,
  onHoverPotion,
  onHoverDecoction,
  onHoverSkill,
}: ToxicityPlannerProps): JSX.Element {
  const pane = useRef<HTMLDivElement>(null);
  const tooltip = usePaneTooltip<Tip>(pane);
  const tip = tooltip.tip;
  const tips: ToxicityTips = {
    showElixir: (event, title, elixir, hint) => {
      tooltip.show(event.currentTarget.closest('.elixir'), { kind: 'elixir', title, elixir, hint });
    },
    showSkill: (event, skill, hint) => {
      onHoverSkill(skill);
      tooltip.show(event.currentTarget, { kind: 'skill', skill, hint });
    },
    hide: tooltip.hide,
  };

  return (
    <div ref={pane} className="pane-content toxicity" style={{ maxWidth: PANE_WIDTH }}>
      <ToxicitySummary catalog={catalog} build={build} onChange={onChange} tips={tips} />

      <h3 className="elixir-heading">Decoctions</h3>
      <DecoctionGrid
        catalog={catalog}
        build={build}
        onChange={onChange}
        onHover={onHoverDecoction}
        tips={tips}
      />

      <h3 className="elixir-heading">Potions</h3>
      <PotionGrid
        catalog={catalog}
        build={build}
        onChange={onChange}
        onHover={onHoverPotion}
        tips={tips}
      />

      {tip?.content.kind === 'skill' && (
        <SkillTooltip
          skill={tip.content.skill}
          rank={build.rank(tip.content.skill)}
          placement={tip.placement}
          hint={tip.content.hint}
        />
      )}
      {tip?.content.kind === 'elixir' && (
        <GameTooltip
          title={tip.content.title}
          subtitle={`Toxicity ${tip.content.elixir.toxicity} · ${formatDuration(tip.content.elixir.duration)}`}
          placement={tip.placement}
          hint={tip.content.hint}
        >
          <p className="game-tooltip-label">{tip.content.elixir.effect}</p>
        </GameTooltip>
      )}
    </div>
  );
}
