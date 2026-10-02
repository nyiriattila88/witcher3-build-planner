import type { JSX, ReactNode } from 'react';
import { MAX_RANK, SYNERGY, type Build } from '../build/build';
import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { DecoctionData, PotionData } from '../data/alchemy';
import {
  decoctionIconUrl,
  formatDuration,
  iconUrl,
  mutagenEffect,
  mutagenIconUrl,
  potionIconUrl,
  potionTierName,
  treeColour,
} from './appearance';
import { MutationDisc } from './mutation-disc';
import { tabName, tabTip, type PlannerTab } from './planner-tab';

// What the info panel explains: the open tab, or what is under the pointer.
export type InfoTarget =
  | { readonly kind: 'tab'; readonly tab: PlannerTab }
  | { readonly kind: 'skill'; readonly skill: Skill }
  | { readonly kind: 'mutation'; readonly mutation: Mutation }
  | { readonly kind: 'mutagen'; readonly mutagen: Mutagen }
  | { readonly kind: 'potion'; readonly potion: PotionData; readonly tier: number }
  | { readonly kind: 'decoction'; readonly decoction: DecoctionData };

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
    case 'potion':
      return <PotionInfo potion={target.potion} tier={target.tier} build={build} />;
    case 'decoction':
      return <DecoctionInfo decoction={target.decoction} />;
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
  const slotted = build.slotOf(skill) >= 0;
  const icon = (
    <span className="tile" style={{ color: treeColour(skill.tree) }}>
      <img src={iconUrl(skill)} alt="" draggable={false} />
    </span>
  );
  const meta = (
    <>
      {skill.tree} skill · Rank {rank}/{MAX_RANK}
      {slotted ? ' · Slotted' : ''}
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

const TIER_NAMES = ['Base', 'Enhanced', 'Superior'];

function PotionInfo({
  potion,
  tier,
  build,
}: {
  potion: PotionData;
  tier: number;
  build: Build;
}): JSX.Element {
  const icon = <img src={potionIconUrl(potion)} alt="" draggable={false} />;
  const shown = potion.tiers[tier - 1] ?? potion.tiers[0];
  const active = build.potionTier(potion);
  const meta = `Potion · Toxicity ${shown.toxicity} · ${formatDuration(shown.duration)}${
    active > 0 ? ` · ${potionTierName(potion, active)} active` : ''
  }`;
  return (
    <InfoLayout icon={icon} title={potionTierName(potion, tier)} meta={meta}>
      {potion.tiers.map((each, i) => (
        <p key={i} className={i + 1 === active ? 'info-rank reached' : 'info-rank'}>
          <b>{potion.tiers.length === 1 ? 'Potion' : TIER_NAMES[i]}</b>
          <span>
            {[...each.effects, `Toxicity ${each.toxicity} · ${formatDuration(each.duration)}`].join(
              '\n',
            )}
          </span>
        </p>
      ))}
    </InfoLayout>
  );
}

function DecoctionInfo({ decoction }: { decoction: DecoctionData }): JSX.Element {
  const icon = <img src={decoctionIconUrl(decoction)} alt="" draggable={false} />;
  const meta = `Decoction · Toxicity ${decoction.toxicity} · ${formatDuration(decoction.duration)}`;
  return (
    <InfoLayout icon={icon} title={decoction.name} meta={meta}>
      <p className="info-text">{decoction.effects.join(' ')}</p>
    </InfoLayout>
  );
}
