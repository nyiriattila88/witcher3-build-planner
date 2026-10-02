import type { JSX, ReactNode } from 'react';
import { MAX_RANK, SYNERGY, type Build } from '../build/build';
import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import { iconUrl, mutagenEffect, mutagenIconUrl, treeColour } from './appearance';
import { MutationDisc } from './mutation-disc';
import { tabName, tabTip, type PlannerTab } from './planner-tab';

// What the info panel explains: the open tab, or the skill, mutation or mutagen under the pointer.
export type InfoTarget =
  | { readonly kind: 'tab'; readonly tab: PlannerTab }
  | { readonly kind: 'skill'; readonly skill: Skill }
  | { readonly kind: 'mutation'; readonly mutation: Mutation }
  | { readonly kind: 'mutagen'; readonly mutagen: Mutagen };

type InfoPanelProps = {
  readonly target: InfoTarget;
  readonly build: Build;
  readonly catalog: Catalog;
};

export function InfoPanel({ target, build, catalog }: InfoPanelProps): JSX.Element {
  return (
    <section className="info" aria-live="polite">
      <InfoContent target={target} build={build} catalog={catalog} />
    </section>
  );
}

function InfoContent({ target, build, catalog }: InfoPanelProps): JSX.Element {
  switch (target.kind) {
    case 'tab':
      return (
        <InfoLayout title={tabName(target.tab)}>
          <p className="info-text">{tabTip(target.tab)}</p>
        </InfoLayout>
      );
    case 'skill':
      return <SkillInfo skill={target.skill} build={build} />;
    case 'mutation':
      return <MutationInfo mutation={target.mutation} build={build} catalog={catalog} />;
    case 'mutagen':
      return <MutagenInfo mutagen={target.mutagen} />;
  }
}

type InfoLayoutProps = {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly meta?: ReactNode;
  readonly children: ReactNode;
};

// An icon beside the title and its details, then the text, the way the game's tooltips read.
function InfoLayout({ icon, title, meta, children }: InfoLayoutProps): JSX.Element {
  return (
    <>
      <header className="info-head">
        {icon !== undefined && <span className="info-icon">{icon}</span>}
        <div>
          <h2>{title}</h2>
          {meta !== undefined && <p className="info-meta">{meta}</p>}
        </div>
      </header>
      {children}
    </>
  );
}

const names = (skills: readonly Skill[]): string | null =>
  skills.length > 0 ? skills.map((skill) => skill.name).join(', ') : null;

function SkillInfo({ skill, build }: { skill: Skill; build: Build }): JSX.Element {
  const rank = build.rank(skill);
  const slot = build.slotOf(skill);
  const icon = (
    <span className="tile" style={{ color: treeColour(skill.tree) }}>
      <img src={iconUrl(skill)} alt="" draggable={false} />
    </span>
  );
  const meta = (
    <>
      {skill.tree} skill · Rank {rank}/{MAX_RANK}
      {slot >= 0 ? ` · Slot ${slot + 1}` : ''}
      <br />
      Unlocked by: {names(skill.requires) ?? 'starting skill'} · Unlocks:{' '}
      {names(skill.unlocks) ?? 'none'}
    </>
  );
  return (
    <InfoLayout icon={icon} title={skill.name} meta={meta}>
      {skill.ranks.map((text, i) => (
        <p key={i} className={i < rank ? 'info-rank reached' : 'info-rank'}>
          <b>Rank {i + 1}</b>
          <span>{text}</span>
        </p>
      ))}
    </InfoLayout>
  );
}

function MutationInfo({
  mutation,
  build,
  catalog,
}: {
  mutation: Mutation;
  build: Build;
  catalog: Catalog;
}): JSX.Element {
  const requires = mutation.requires.map((id) => catalog.mutation(id)?.name ?? id).join(' and ');
  const unlockedSlots = catalog.extraSlotUnlocks.filter(
    (needed) => build.researchedCount >= needed,
  ).length;
  const meta = (
    <>
      {mutation.trees.join(' / ')} mutation · Research cost: {mutation.cost}
      {requires === '' ? '' : ` · Requires: ${requires}`}
      {mutation.innate && (
        <>
          <br />
          Mutations researched: {build.researchedCount} · Extra slots unlocked: {unlockedSlots}
        </>
      )}
    </>
  );
  return (
    <InfoLayout icon={<MutationDisc mutation={mutation} />} title={mutation.name} meta={meta}>
      <p className="info-text">{mutation.description}</p>
    </InfoLayout>
  );
}

function MutagenInfo({ mutagen }: { mutagen: Mutagen }): JSX.Element {
  const icon = <img src={mutagenIconUrl(mutagen)} alt="" draggable={false} />;
  const meta = `${mutagen.tree} mutagen · ${mutagenEffect(mutagen, mutagen.bonus)}`;
  return (
    <InfoLayout icon={icon} title={mutagen.name} meta={meta}>
      <p className="info-text">
        In a mutagen slot it gives {mutagenEffect(mutagen, mutagen.bonus)}. Every {mutagen.tree}{' '}
        skill slotted in the same group adds that bonus once more, and Synergy in a slot raises it
        by {SYNERGY.bonusPerRank * 100}% per rank.
      </p>
    </InfoLayout>
  );
}
