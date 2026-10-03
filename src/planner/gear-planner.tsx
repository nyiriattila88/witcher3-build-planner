import { useRef, type CSSProperties, type JSX, type MouseEvent } from 'react';
import { SET_PIECES, upgradeKind, type Build } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import {
  GEAR_SLOTS,
  GEAR_TIERS,
  type GearItemData,
  type GearSlot,
  type SetBonusData,
} from '../data/gear';
import { ENCHANTMENT_SOCKETS } from '../data/upgrades';
import {
  GEAR_SLOT_NAMES,
  gearKindText,
  gearStatText,
  gearTileLines,
  gearValue,
  statBonusText,
} from './appearance';
import { PANE_WIDTH } from './geometry';
import type { InfoTarget } from './info-panel';
import { usePaneTooltip } from './use-pane-tooltip';

type GearPlannerProps = {
  readonly catalog: Catalog;
  readonly build: Build;
  readonly onChange: (change: (draft: Build) => void) => void;
  readonly onHover: (target: InfoTarget) => void;
};

type ItemTip = { readonly item: GearItemData; readonly hint: string };

const wornValue = (item: GearItemData | null): string => (item === null ? 'none' : gearValue(item));

// The schools side by side for every slot, so they mix freely, then the sockets of what is worn.
export function GearPlanner(props: GearPlannerProps): JSX.Element {
  const { catalog, build } = props;
  const pane = useRef<HTMLDivElement>(null);
  const tooltip = usePaneTooltip<ItemTip>(pane);
  const sets = catalog.setBonuses.flatMap((set) => {
    const pieces = build.setPieces(set.school);
    return pieces > 0 ? [{ set, pieces }] : [];
  });

  return (
    <div ref={pane} className="pane-content gear" style={{ width: PANE_WIDTH }}>
      <section className="gear-summary">
        <dl className="gear-totals">
          <div>
            <dt>Armor</dt>
            <dd>{build.armorValue()}</dd>
          </div>
          <div>
            <dt>Steel sword damage</dt>
            <dd>{wornValue(build.gearAt('steel'))}</dd>
          </div>
          <div>
            <dt>Silver sword damage</dt>
            <dd>{wornValue(build.gearAt('silver'))}</dd>
          </div>
        </dl>
        {sets.length === 0 ? (
          <p className="gear-hint">
            Wear {SET_PIECES.first} or {SET_PIECES.full} pieces of one school for its set bonuses.
          </p>
        ) : (
          sets.map(({ set, pieces }) => <SetStatus key={set.school} set={set} pieces={pieces} />)
        )}
      </section>

      {GEAR_SLOTS.map((slot) => (
        <SlotPicker
          key={slot}
          {...props}
          slot={slot}
          onTip={(target, item, hint) => {
            tooltip.show(target, { item, hint });
          }}
          onLeave={tooltip.hide}
        />
      ))}

      {tooltip.tip !== null && (
        <GearTooltip
          {...tooltip.tip.content}
          weight={catalog.setBonus(tooltip.tip.content.item.school).weight}
          placement={tooltip.tip.placement}
        />
      )}
    </div>
  );
}

type GearTooltipProps = ItemTip & {
  readonly weight: SetBonusData['weight'];
  readonly placement: CSSProperties;
};

// The in-game tooltip of an item: what it is, its level, damage or armor and sockets, then its bonuses.
function GearTooltip({ item, hint, weight, placement }: GearTooltipProps): JSX.Element {
  return (
    <div className="game-tooltip" style={placement} role="tooltip">
      <div className="game-tooltip-head">
        <b>{item.name}</b>
        <span>
          {gearKindText(item, weight)} · Level {item.level} · {gearStatText(item)} · {item.sockets}{' '}
          sockets
        </span>
      </div>
      {item.bonuses.map((bonus, i) => (
        <p key={bonus[0]} className={i === 0 ? 'game-tooltip-label' : undefined}>
          {statBonusText(bonus)}
        </p>
      ))}
      <p className="game-tooltip-hint">{hint}</p>
    </div>
  );
}

function SetStatus({ set, pieces }: { set: SetBonusData; pieces: number }): JSX.Element {
  return (
    <div className="gear-set">
      <b>{set.school} set</b> · {pieces} of {SET_PIECES.full} pieces
      {set.three === null || set.six === null ? (
        <p>No set bonuses.</p>
      ) : (
        <>
          <p className={pieces >= SET_PIECES.first ? 'active' : undefined}>
            <span>{SET_PIECES.first} pieces:</span> {set.three}
            {set.perPiece !== null &&
              pieces >= SET_PIECES.first &&
              ` Now ${set.perPiece * pieces}%.`}
          </p>
          <p className={pieces >= SET_PIECES.full ? 'active' : undefined}>
            <span>{SET_PIECES.full} pieces:</span> {set.six}
          </p>
        </>
      )}
    </div>
  );
}

type SlotPickerProps = GearPlannerProps & {
  readonly slot: GearSlot;
  readonly onTip: (target: Element | null, item: GearItemData, hint: string) => void;
  readonly onLeave: () => void;
};

function SlotPicker(props: SlotPickerProps): JSX.Element {
  const { catalog, build, onChange, onHover, slot } = props;
  const worn = build.gearAt(slot);
  return (
    <section className="gear-slot">
      <h3 className="elixir-heading">{GEAR_SLOT_NAMES[slot]}</h3>
      <div className="gear-schools">
        {catalog.finalGear
          .filter((item) => item.slot === slot)
          .map((final) => (
            <SchoolTile
              key={final.school}
              {...props}
              final={final}
              versions={catalog.versions(final)}
              worn={worn}
            />
          ))}
      </div>
      {worn !== null && (
        <Sockets
          catalog={catalog}
          build={build}
          onChange={onChange}
          onHover={onHover}
          slot={slot}
          item={worn}
        />
      )}
    </section>
  );
}

// One numeral per tier, so V means grandmaster on every tile.
const TIER_NUMERALS = ['I', 'II', 'III', 'IV', 'V'];

type SchoolTileProps = SlotPickerProps & {
  readonly final: GearItemData;
  readonly versions: readonly GearItemData[];
  readonly worn: GearItemData | null;
};

// One school's item for the slot with a button per tier, the way a potion has one per version. A tier
// the school does not make shows greyed out.
function SchoolTile({
  catalog,
  onChange,
  onHover,
  onTip,
  onLeave,
  slot,
  final,
  versions,
  worn,
}: SchoolTileProps): JSX.Element {
  const wornHere = versions.find((version) => version === worn) ?? null;
  const shown = wornHere ?? final;
  const [figure, detail] = gearTileLines(shown, catalog.setBonus(final.school).weight);
  const tileOf = (event: MouseEvent): Element | null => event.currentTarget.closest('.gear-school');
  return (
    <div
      className={wornHere === null ? 'gear-school' : 'gear-school active'}
      onMouseEnter={(event) => {
        onHover({ kind: 'gear', item: shown });
        onTip(
          event.currentTarget,
          shown,
          wornHere === null
            ? 'Pick a version to wear it'
            : 'Click its version again to take it off',
        );
      }}
      onMouseLeave={onLeave}
    >
      <span className="gear-school-name">{final.school}</span>
      <span className="gear-school-stat">{figure}</span>
      <span className="gear-school-stat">{detail}</span>
      <span className="tier-buttons">
        {GEAR_TIERS.map((tier, i) => {
          const version = versions.find((each) => each.tier === tier);
          if (version === undefined) {
            return (
              <button key={tier} type="button" disabled title={`No ${tier} version`}>
                {TIER_NUMERALS[i]}
              </button>
            );
          }
          const chosen = version === worn;
          return (
            <button
              key={tier}
              type="button"
              className={chosen ? 'active' : undefined}
              aria-pressed={chosen}
              aria-label={version.name}
              onClick={() => {
                onChange((draft) => {
                  draft.equip(slot, chosen ? null : version);
                });
              }}
              onMouseEnter={(event) => {
                onHover({ kind: 'gear', item: version });
                onTip(
                  tileOf(event),
                  version,
                  chosen ? 'Click to take it off' : 'Click to wear this version',
                );
              }}
              onFocus={() => {
                onHover({ kind: 'gear', item: version });
              }}
            >
              {TIER_NUMERALS[i]}
            </button>
          );
        })}
      </span>
    </div>
  );
}

// A runeword or glyphword fills every socket, otherwise each socket takes a rune or glyph of its own.
// The sockets in the left column, the runeword or glyphword that would fill them in the right one. What
// the item worn has no room for stays, greyed out, until an item with room for it is worn.
function Sockets({
  catalog,
  build,
  onChange,
  onHover,
  slot,
  item,
}: GearPlannerProps & { readonly slot: GearSlot; readonly item: GearItemData }): JSX.Element {
  const words = catalog.enchantments.filter((word) => build.canEnchant(slot, word));
  const word = build.enchantmentAt(slot);
  const filled = build.isEnchantmentActive(slot);
  const upgrades = catalog.upgrades.filter((upgrade) => upgrade.kind === upgradeKind(slot));
  const wordLabel = slot === 'armor' ? 'Glyphword' : 'Runeword';
  const sockets = Array.from({ length: catalog.maxSockets(slot) }, (_, socket) => {
    const held = build.upgradeAt(slot, socket);
    if (!build.isSocketOpen(slot, socket)) {
      return held === null ? null : (
        <Idle
          key={socket}
          label={`Socket ${socket + 1}`}
          text={`${held.name}: ${statBonusText(held.bonus)}`}
          reason="no socket for it on this item"
        />
      );
    }
    return (
      <Choice
        key={socket}
        label={`Socket ${socket + 1}`}
        options={upgrades}
        held={held}
        empty="Empty"
        describe={(each) => `${each.name}: ${statBonusText(each.bonus)}`}
        onPick={(chosen) => {
          onChange((draft) => {
            draft.setUpgrade(slot, socket, chosen);
          });
        }}
        onHover={(upgrade) => {
          onHover({ kind: 'upgrade', upgrade });
        }}
      />
    );
  });
  return (
    <div className="gear-sockets">
      <div className="gear-column">
        {filled && word !== null ? (
          <p className="gear-idle">Every socket is taken by {word.name}.</p>
        ) : item.sockets === 0 && sockets.every((each) => each === null) ? (
          <p className="gear-idle">This item has no sockets.</p>
        ) : (
          sockets
        )}
      </div>
      {(words.length > 0 || word !== null) && (
        <div className="gear-column">
          {words.length > 0 ? (
            <Choice
              label={wordLabel}
              options={words}
              held={word}
              empty="None, use the sockets"
              describe={(each) => `${each.name} (level ${each.level})`}
              onPick={(chosen) => {
                onChange((draft) => {
                  draft.enchant(slot, chosen);
                });
              }}
              onHover={(enchantment) => {
                onHover({ kind: 'enchantment', enchantment });
              }}
            />
          ) : (
            word !== null && (
              <Idle
                label={wordLabel}
                text={word.name}
                reason={`it needs an item with ${ENCHANTMENT_SOCKETS} sockets`}
              />
            )
          )}
          {filled && word !== null && <p className="gear-enchantment">{word.effect}</p>}
        </div>
      )}
    </div>
  );
}

// Something planned for the slot that the item worn has no room for, kept for an item that has.
function Idle({
  label,
  text,
  reason,
}: {
  label: string;
  text: string;
  reason: string;
}): JSX.Element {
  return (
    <div className="gear-socket gear-idle">
      <span>{label}</span>
      <span>
        {text}, idle: {reason}
      </span>
    </div>
  );
}

type ChoiceProps<T extends { readonly name: string }> = {
  readonly label: string;
  readonly options: readonly T[];
  readonly held: T | null;
  readonly empty: string;
  readonly describe: (option: T) => string;
  readonly onPick: (option: T | null) => void;
  readonly onHover: (option: T) => void;
};

function Choice<T extends { readonly name: string }>({
  label,
  options,
  held,
  empty,
  describe,
  onPick,
  onHover,
}: ChoiceProps<T>): JSX.Element {
  return (
    <label className="gear-socket">
      <span>{label}</span>
      <select
        value={held?.name ?? ''}
        onChange={(event) => {
          const chosen = options.find((option) => option.name === event.target.value) ?? null;
          onPick(chosen);
          if (chosen !== null) onHover(chosen);
        }}
        onMouseEnter={() => {
          if (held !== null) onHover(held);
        }}
      >
        <option value="">{empty}</option>
        {options.map((option) => (
          <option key={option.name} value={option.name}>
            {describe(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
