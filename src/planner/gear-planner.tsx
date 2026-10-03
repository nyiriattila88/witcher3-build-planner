import { useRef, type JSX, type MouseEvent } from 'react';
import { SET_PIECES, upgradeKind, type Build } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import { GEAR_SLOTS, type GearItemData, type GearSlot, type SetBonusData } from '../data/gear';
import { GEAR_SLOT_NAMES, gearStatText, gearValue, statBonusText } from './appearance';
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
        <div className="game-tooltip" style={tooltip.tip.placement} role="tooltip">
          <div className="game-tooltip-head">
            <b>{tooltip.tip.content.item.name}</b>
            <span>
              Level {tooltip.tip.content.item.level} · {gearStatText(tooltip.tip.content.item)} ·{' '}
              {tooltip.tip.content.item.sockets} sockets
            </span>
          </div>
          {tooltip.tip.content.item.bonuses.map((bonus, i) => (
            <p key={bonus[0]} className={i === 0 ? 'game-tooltip-label' : undefined}>
              {statBonusText(bonus)}
            </p>
          ))}
          <p className="game-tooltip-hint">{tooltip.tip.content.hint}</p>
        </div>
      )}
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

const VERSION_LABELS = ['I', 'II', 'III', 'IV', 'V'];

type SchoolTileProps = SlotPickerProps & {
  readonly final: GearItemData;
  readonly versions: readonly GearItemData[];
  readonly worn: GearItemData | null;
};

// One school's item for the slot with a button per version, the way a potion has one per tier.
function SchoolTile({
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
      <span className="gear-school-stat">{gearStatText(shown)}</span>
      <span className="tier-buttons">
        {versions.map((version, i) => {
          const chosen = version === worn;
          return (
            <button
              key={version.name}
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
              {versions.length === 1 ? 'On' : VERSION_LABELS[i]}
            </button>
          );
        })}
      </span>
    </div>
  );
}

// A runeword or glyphword fills every socket, otherwise each socket takes a rune or glyph of its own.
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
  const upgrades = catalog.upgrades.filter((upgrade) => upgrade.kind === upgradeKind(slot));
  const sockets = Array.from({ length: item.sockets }, (_, socket) => (
    <Choice
      key={socket}
      label={`Socket ${socket + 1}`}
      options={upgrades}
      held={build.upgradeAt(slot, socket)}
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
  ));
  // The enchantment in one column, the sockets it would fill in the other.
  return (
    <div className="gear-sockets">
      {words.length > 0 && (
        <div className="gear-column">
          <Choice
            label={slot === 'armor' ? 'Glyphword' : 'Runeword'}
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
        </div>
      )}
      <div className="gear-column">
        {word === null ? sockets : <p className="gear-enchantment">{word.effect}</p>}
      </div>
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
