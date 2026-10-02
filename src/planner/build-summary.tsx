import type { JSX, ReactNode } from 'react';
import { MAX_RANK, MUTAGEN_GROUPS, type Build } from '../build/build';
import type { Catalog } from '../catalog/catalog';
import { mutagenColour, mutagenEffect, potionTierName, treeColour } from './appearance';

type BuildSummaryProps = { readonly build: Build; readonly catalog: Catalog };

const marker = (slotted: boolean): string => (slotted ? '◆ ' : '');

// The board does not number its slots, so a mutagen is named after the corner of its group.
const GROUP_NAMES = ['Top left', 'Top right', 'Bottom left', 'Bottom right'];

export function BuildSummary({ build, catalog }: BuildSummaryProps): JSX.Element | null {
  const sections: { title: string; colour: string; lines: ReactNode[] }[] = [];

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

  const bonuses = Array.from({ length: MUTAGEN_GROUPS }, (_, group) => ({
    group,
    bonus: build.mutagenBonus(group),
  }));
  const placed = bonuses.flatMap(({ group, bonus }) => (bonus === null ? [] : [{ group, bonus }]));
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

  const potions = catalog.potions.filter((potion) => build.potionTier(potion) > 0);
  const decoctions = catalog.decoctions.filter((decoction) => build.isDecoctionActive(decoction));
  if (potions.length + decoctions.length > 0) {
    sections.push({
      title: `Toxicity ${build.toxicity()} of ${build.maxToxicity()}`,
      colour: 'var(--tab-toxicity)',
      lines: [
        ...decoctions.map((decoction) => `${decoction.name} (${decoction.toxicity})`),
        ...potions.map((potion) => {
          const tier = build.potionTier(potion);
          return `${potionTierName(potion, tier)} (${potion.tiers[tier - 1]?.toxicity ?? 0})`;
        }),
      ],
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
