import type { JSX } from 'react';
import type { Build, BuildView } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import type { PotionData } from '../data/alchemy';
import { potionIconUrl } from './asset-urls';
import { TOO_TOXIC, elixirState, type ElixirState, type ToxicityTips } from './elixir-tile';
import { formatDuration, potionTierName } from './game-text';

type PotionGridProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onHover: (potion: PotionData, tier: number) => void;
  readonly tips: ToxicityTips;
};

const TIER_LABELS = ['I', 'II', 'III'];

const TIER_HINTS: Readonly<Record<ElixirState, string>> = {
  active: 'Click to take it off',
  available: 'Click to make this one active',
  blocked: TOO_TOXIC,
};

// What the buttons of a potion's tile do, or why none of them can.
const potionHint = (potion: PotionData, blocked: boolean): string => {
  if (blocked) return TOO_TOXIC;
  return potion.tiers.length === 1
    ? 'Click On to make it active'
    : 'Pick I, II or III to make one active';
};

// Every potion as a tile, with a button per version: base, enhanced and superior.
export function PotionGrid({ catalog, ...tile }: PotionGridProps): JSX.Element {
  return (
    <div className="elixir-grid">
      {catalog.potions.map((potion) => (
        <PotionTile key={potion.name} potion={potion} {...tile} />
      ))}
    </div>
  );
}

function PotionTile({
  potion,
  build,
  onChange,
  onHover,
  tips,
}: Omit<PotionGridProps, 'catalog'> & { potion: PotionData }): JSX.Element {
  const plan = build.toxicityPlan;
  const max = build.maxToxicity();
  const tier = plan.potionTier(potion);
  const shown = potion.tiers[Math.max(0, tier - 1)] ?? potion.tiers[0];
  const shownTier = Math.max(1, tier);
  const blocked =
    tier === 0 && potion.tiers.every((_, i) => !plan.canSetPotionTier(potion, i + 1, max));
  return (
    <div
      className={`elixir ${elixirState(tier > 0, !blocked)}`}
      onMouseEnter={(event) => {
        onHover(potion, shownTier);
        tips.showElixir(
          event,
          potionTierName(potion, shownTier),
          shown,
          potionHint(potion, blocked),
        );
      }}
      onMouseLeave={tips.hide}
    >
      <img src={potionIconUrl(potion)} alt="" draggable={false} />
      <span className="elixir-name">{potion.name}</span>
      <span className="elixir-meta">
        {shown.toxicity} · {formatDuration(shown.duration)}
      </span>
      <span className="tier-buttons">
        {potion.tiers.map((each, i) => {
          const chosen = tier === i + 1;
          const state = elixirState(chosen, plan.canSetPotionTier(potion, i + 1, max));
          return (
            <button
              key={i}
              type="button"
              className={state === 'available' ? undefined : state}
              aria-pressed={chosen}
              aria-disabled={state === 'blocked'}
              aria-label={potionTierName(potion, i + 1)}
              onClick={() => {
                if (state === 'blocked') return;
                onChange((draft) => {
                  draft.toxicityPlan.setPotionTier(potion, chosen ? 0 : i + 1);
                });
              }}
              onMouseEnter={(event) => {
                onHover(potion, i + 1);
                tips.showElixir(event, potionTierName(potion, i + 1), each, TIER_HINTS[state]);
              }}
              onFocus={() => {
                onHover(potion, i + 1);
              }}
            >
              {potion.tiers.length === 1 ? 'On' : TIER_LABELS[i]}
            </button>
          );
        })}
      </span>
    </div>
  );
}
