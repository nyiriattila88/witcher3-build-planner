import type { JSX, ReactNode } from 'react';
import { MAX_RANK, MUTAGEN_GROUPS, type BuildView, type MutagenBonus } from '../build/build';
import { SET_PIECES } from '../build/gear-loadout';
import type { Catalog } from '../catalog/catalog';
import { GEAR_SLOTS } from '../data/gear';
import {
  GROUP_NAMES,
  mutagenColour,
  mutagenEffect,
  potionTierName,
  treeColour,
} from './appearance';

type BuildSummaryProps = { readonly build: BuildView; readonly catalog: Catalog };

type StatTotal = { stat: string; value: number; unit: string; colour: string | null };

const marker = (slotted: boolean): string => (slotted ? '◆ ' : '');

// One line per stat: the tree bonuses of the slotted skills, the mutagens in tree order, then the gear
// with its runes and glyphs. Bonuses to the same stat add up, coloured after where the first came from.
function totalBonuses(
  build: BuildView,
  catalog: Catalog,
  mutagens: readonly MutagenBonus[],
): ReactNode[] {
  const totals = new Map<string, StatTotal>();
  const add = (stat: string, value: number, unit: string, colour: string | null): void => {
    const key = `${stat.toLowerCase()}|${unit}`;
    const total = totals.get(key);
    if (total === undefined) totals.set(key, { stat, value, unit, colour });
    else total.value += value;
  };
  for (const tree of catalog.trees) {
    const value = build.treeBonus(tree.name);
    if (value > 0) add(tree.bonus.stat, value, tree.bonus.unit, treeColour(tree.name));
  }
  for (const tree of catalog.trees) {
    for (const { mutagen, value } of mutagens) {
      if (mutagen.tree === tree.name)
        add(mutagen.effect, value, mutagen.unit, mutagenColour(mutagen));
    }
  }
  for (const [stat, value, unit] of build.gear.bonuses()) add(stat, value, unit, null);
  return [...totals.values()].map(({ stat, value, unit, colour }) => (
    <>
      <span style={colour === null ? undefined : { color: colour }}>{stat}</span> +{value}
      {unit}
    </>
  ));
}

// What is worn, with the runes, glyphs or enchantment in it, then the set bonuses that apply.
function gearLines(build: BuildView, catalog: Catalog): string[] {
  const items = GEAR_SLOTS.flatMap((slot) => {
    const item = build.gear.itemAt(slot);
    if (item === null) return [];
    const word = build.gear.isEnchantmentActive(slot) ? build.gear.enchantmentAt(slot) : null;
    const inset = Array.from({ length: item.sockets }, (_, socket) =>
      build.gear.upgradeAt(slot, socket),
    );
    const extras = word === null ? inset.flatMap((each) => each?.name ?? []) : [word.name];
    return [extras.length > 0 ? `${item.name} (${extras.join(', ')})` : item.name];
  });
  const sets = catalog.setBonuses.flatMap(({ school, bonuses }) => {
    const pieces = build.gear.setPieces(school);
    if (pieces < SET_PIECES.first || bonuses === null) return [];
    const reached = pieces >= SET_PIECES.full ? '3 and 6 piece bonuses' : '3 piece bonus';
    return [`${school} set, ${pieces} pieces: ${reached}`];
  });
  return [...items, ...sets];
}

export function BuildSummary({ build, catalog }: BuildSummaryProps): JSX.Element | null {
  const sections: { title: string; colour: string; lines: ReactNode[] }[] = [];
  const placed = Array.from({ length: MUTAGEN_GROUPS }, (_, group) => ({
    group,
    bonus: build.mutagenBonus(group),
  })).flatMap(({ group, bonus }) => (bonus === null ? [] : [{ group, bonus }]));

  const bonuses = totalBonuses(
    build,
    catalog,
    placed.map(({ bonus }) => bonus),
  );
  if (bonuses.length > 0) {
    sections.push({ title: 'Total bonuses', colour: 'var(--gold)', lines: bonuses });
  }

  for (const tree of catalog.trees) {
    const learned = tree.skills.filter((skill) => build.rank(skill) > 0);
    if (learned.length === 0) continue;
    sections.push({
      title: tree.name,
      colour: treeColour(tree.name),
      lines: learned.map(
        (skill) =>
          `${marker(build.slotOf(skill) >= 0)}${skill.name} ${build.rank(skill)}/${MAX_RANK}`,
      ),
    });
  }

  if (placed.length > 0) {
    sections.push({
      title: 'Mutagens',
      colour: 'var(--tab-mutagens)',
      lines: placed.map(({ group, bonus }) => (
        <>
          {GROUP_NAMES[group]}:{' '}
          <span style={{ color: mutagenColour(bonus.mutagen) }}>{bonus.mutagen.name}</span> →{' '}
          {mutagenEffect(bonus.mutagen, bonus.value)}
        </>
      )),
    });
  }

  const researched = catalog.mutations.filter(
    (mutation) => !mutation.innate && build.isResearched(mutation.id),
  );
  if (researched.length > 0) {
    sections.push({
      title: 'Mutations',
      colour: 'var(--tab-mutations)',
      lines: researched.map(
        (mutation) => `${marker(build.slottedMutation === mutation.id)}${mutation.name}`,
      ),
    });
  }

  const potions = catalog.potions.filter((potion) => build.toxicityPlan.potionTier(potion) > 0);
  const decoctions = catalog.decoctions.filter((decoction) =>
    build.toxicityPlan.isDecoctionActive(decoction),
  );
  if (potions.length + decoctions.length > 0) {
    sections.push({
      title: `Toxicity ${build.toxicityPlan.toxicity()} of ${build.maxToxicity()}`,
      colour: 'var(--tab-toxicity)',
      lines: [
        ...decoctions.map((decoction) => `${decoction.name} (${decoction.toxicity})`),
        ...potions.map((potion) => {
          const tier = build.toxicityPlan.potionTier(potion);
          return `${potionTierName(potion, tier)} (${potion.tiers[tier - 1]?.toxicity ?? 0})`;
        }),
      ],
    });
  }

  if (build.gear.count > 0) {
    sections.push({
      title: `Gear, armor ${build.gear.armorValue()}`,
      colour: 'var(--tab-gear)',
      lines: gearLines(build, catalog),
    });
  }

  if (sections.length === 0) return null;
  return (
    <section className="summary" aria-label="Build summary">
      <div className="summary-title">Build (◆ = slotted)</div>
      {sections.map(({ title, colour, lines }) => (
        <div key={title}>
          <b style={{ color: colour }}>{title}</b>
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ))}
    </section>
  );
}
