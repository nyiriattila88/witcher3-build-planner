import type { JSX, ReactNode } from 'react';
import { MAX_RANK, SYNERGY, type Build } from '../build/build';
import { SET_PIECES } from '../build/gear-loadout';
import type { Catalog, Mutagen, Mutation, Skill } from '../catalog/catalog';
import type { DecoctionData, PotionData } from '../data/alchemy';
import type { GearItemData } from '../data/gear';
import { ENCHANTMENT_SOCKETS, type EnchantmentData, type UpgradeData } from '../data/upgrades';
import {
  decoctionIconUrl,
  formatDuration,
  gearKindText,
  gearStatText,
  iconUrl,
  mutagenEffect,
  mutagenIconUrl,
  mutationMetaText,
  potionIconUrl,
  potionTierName,
  statBonusText,
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
  | { readonly kind: 'decoction'; readonly decoction: DecoctionData }
  | { readonly kind: 'gear'; readonly item: GearItemData }
  | { readonly kind: 'upgrade'; readonly upgrade: UpgradeData }
  | { readonly kind: 'enchantment'; readonly enchantment: EnchantmentData };

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
    case 'gear':
      return <GearInfo item={target.item} build={build} catalog={catalog} />;
    case 'upgrade':
      return <UpgradeInfo upgrade={target.upgrade} />;
    case 'enchantment':
      return <EnchantmentInfo enchantment={target.enchantment} />;
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
  const meta = (
    <>
      {mutationMetaText(mutation, catalog)}
      {mutation.innate && (
        <>
          <br />
          Mutations researched: {build.researchedCount} · Extra slots unlocked:{' '}
          {build.unlockedExtraSlots}
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
            {`${each.effect}\nToxicity ${each.toxicity} · ${formatDuration(each.duration)}`}
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
      <p className="info-text">{decoction.effect}</p>
    </InfoLayout>
  );
}

function GearInfo({
  item,
  build,
  catalog,
}: {
  item: GearItemData;
  build: Build;
  catalog: Catalog;
}): JSX.Element {
  const set = catalog.setBonus(item.school);
  const pieces = build.gear.setPieces(item.school);
  const final = catalog.versions(item).at(-1) === item;
  const kind = gearKindText(item, set.weight);
  const meta = (
    <>
      {item.school} school · {item.tier} · {kind} · Level {item.level}
      <br />
      {gearStatText(item)} · {item.sockets} {item.sockets === 1 ? 'socket' : 'sockets'} ·{' '}
      {final ? `Set pieces worn: ${pieces}` : 'Only the final version counts for the set'}
    </>
  );
  return (
    <InfoLayout title={item.name} meta={meta}>
      {item.bonuses.map((bonus) => (
        <p key={bonus[0]} className="info-text">
          {statBonusText(bonus)}
        </p>
      ))}
      {set.three === null || set.six === null ? (
        <p className="info-text">{item.school} gear has no set bonuses.</p>
      ) : (
        <>
          <p className={pieces >= SET_PIECES.first ? 'info-rank reached' : 'info-rank'}>
            <b>{SET_PIECES.first} pieces</b>
            <span>{set.three}</span>
          </p>
          <p className={pieces >= SET_PIECES.full ? 'info-rank reached' : 'info-rank'}>
            <b>{SET_PIECES.full} pieces</b>
            <span>{set.six}</span>
          </p>
        </>
      )}
    </InfoLayout>
  );
}

function UpgradeInfo({ upgrade }: { upgrade: UpgradeData }): JSX.Element {
  const meta = upgrade.kind === 'rune' ? 'Rune · goes into a sword' : 'Glyph · goes into armor';
  return (
    <InfoLayout title={upgrade.name} meta={meta}>
      <p className="info-text">{statBonusText(upgrade.bonus)}</p>
    </InfoLayout>
  );
}

function EnchantmentInfo({ enchantment }: { enchantment: EnchantmentData }): JSX.Element {
  const target = enchantment.kind === 'runeword' ? 'a sword' : 'a chest armor';
  const meta = `${enchantment.kind === 'runeword' ? 'Runeword' : 'Glyphword'} · Runewright level ${enchantment.level} · fills ${target} with ${ENCHANTMENT_SOCKETS} sockets`;
  return (
    <InfoLayout title={enchantment.name} meta={meta}>
      <p className="info-text">{enchantment.effect}</p>
      <p className="info-meta">Made from {enchantment.ingredients.join(', ')}</p>
    </InfoLayout>
  );
}
