import type { JSX } from 'react';
import type { Build, BuildView } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import type { DecoctionData } from '../data/alchemy';
import { decoctionIconUrl, formatDuration } from './appearance';
import { TOO_TOXIC, elixirState, type ElixirState, type ToxicityTips } from './elixir-tile';

type DecoctionGridProps = {
  readonly catalog: Catalog;
  readonly build: BuildView;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onHover: (decoction: DecoctionData) => void;
  readonly tips: ToxicityTips;
};

const HINTS: Readonly<Record<ElixirState, string>> = {
  active: 'Click to take it off',
  available: 'Click to make it active',
  blocked: TOO_TOXIC,
};

// Every decoction as a tile that a click makes active or takes off.
export function DecoctionGrid({
  catalog,
  build,
  onChange,
  onHover,
  tips,
}: DecoctionGridProps): JSX.Element {
  const plan = build.toxicityPlan;
  const max = build.maxToxicity();
  return (
    <div className="elixir-grid">
      {catalog.decoctions.map((decoction) => {
        const active = plan.isDecoctionActive(decoction);
        const state = elixirState(active, plan.canActivateDecoction(decoction, max));
        return (
          <button
            key={decoction.name}
            type="button"
            className={`elixir ${state}`}
            aria-pressed={active}
            aria-disabled={state === 'blocked'}
            onClick={(event) => {
              if (state === 'blocked') return;
              onChange((draft) => {
                if (active) draft.toxicityPlan.deactivateDecoction(decoction);
                else draft.toxicityPlan.activateDecoction(decoction);
              });
              // The tile shows what the next click does.
              tips.showElixir(
                event,
                decoction.name,
                decoction,
                HINTS[active ? 'available' : 'active'],
              );
            }}
            onMouseEnter={(event) => {
              onHover(decoction);
              tips.showElixir(event, decoction.name, decoction, HINTS[state]);
            }}
            onMouseLeave={tips.hide}
            onFocus={() => {
              onHover(decoction);
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
  );
}
