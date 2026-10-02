import type { JSX } from 'react';
import { MAX_RANK, SYNERGY, type Build } from '../build/build';
import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import { mutagenEffect, mutationColour } from './appearance';
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
        <>
          <h2>{tabName(target.tab)}</h2>
          <p className="info-meta">{tabTip(target.tab)}</p>
        </>
      );
    case 'skill':
      return <SkillInfo skill={target.skill} build={build} />;
    case 'mutation':
      return <MutationInfo mutation={target.mutation} build={build} catalog={catalog} />;
    case 'mutagen':
      return <MutagenInfo mutagen={target.mutagen} />;
  }
}

const names = (skills: readonly Skill[]): string | null =>
  skills.length > 0 ? skills.map((skill) => skill.name).join(', ') : null;

function SkillInfo({ skill, build }: { skill: Skill; build: Build }): JSX.Element {
  const rank = build.rank(skill);
  const slot = build.slotOf(skill);
  return (
    <>
      <h2>{skill.name}</h2>
      <p className="info-meta">
        {skill.tree} · Rank {rank}/{MAX_RANK}
        {slot >= 0 ? ` · Slot ${slot + 1}` : ''}
        <br />
        Unlocked by: {names(skill.requires) ?? 'Starting skill'}
        <br />
        Unlocks: {names(skill.unlocks) ?? 'none'}
      </p>
      {skill.ranks.map((text, i) => (
        <p key={i} className={i < rank ? 'info-rank reached' : 'info-rank'}>
          <b>Rank {i + 1}:</b> {text}
        </p>
      ))}
    </>
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
  return (
    <>
      <h2 style={{ color: mutationColour(mutation) }}>{mutation.name}</h2>
      <p className="info-meta">
        {mutation.trees.join(' / ')} mutation · Research cost: {mutation.cost}
        {requires === '' ? '' : ` · Requires: ${requires}`}
        {mutation.innate && (
          <>
            <br />
            Mutations researched: {build.researchedCount} · Extra slots unlocked: {unlockedSlots}
          </>
        )}
      </p>
      <p className="info-rank reached">{mutation.description}</p>
    </>
  );
}

function MutagenInfo({ mutagen }: { mutagen: Mutagen }): JSX.Element {
  return (
    <>
      <h2>{mutagen.name}</h2>
      <p className="info-meta">
        {mutagenEffect(mutagen, mutagen.bonus)} per mutagen, multiplied by 1 + the number of{' '}
        {mutagen.tree} skills slotted in the same group. Synergy (slotted) adds{' '}
        {SYNERGY.bonusPerRank * 100}% per rank.
      </p>
    </>
  );
}
