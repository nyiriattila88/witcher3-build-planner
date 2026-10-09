import type { Catalog, Skill } from '../catalog/catalog';
import { ALCHEMY_RECIPES, MANTICORE_ARMOR } from '../data/alchemy';
import { GEAR_SLOTS, type GearItemData } from '../data/gear';
import type { TreeName } from '../data/skills';
import { Build, MAX_RANK, MUTAGEN_GROUPS } from './build';
import { holdsEnchantment, upgradeKind } from './gear-loadout';
import { createLegacyDecoder, LEGACY_PREFIX } from './legacy-build-code';

export type BuildCodec = {
  readonly encode: (build: Build) => string;
  // Returns null for anything but the one code a build encodes to.
  readonly decode: (text: string) => Build | null;
};

// Codes since 2.13 open with this mark, because the General links open both ways since then. The
// unmarked codes before them read every link one way and still open as they were written.
const MARK = '.';
// 2.1.0 wrote the unmarked codes behind this marker, which read like a version, so it is only read.
const MARKER_2_1_0 = '2.';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
// Longer than any build code, so pasted text never turns into a huge number.
const MAX_BODY_LENGTH = 120;
const FLAGS: readonly boolean[] = [false, true];
const RANKS = Array.from({ length: MAX_RANK + 1 }, (_, rank) => rank);
const upTo = (last: number): readonly number[] => Array.from({ length: last + 1 }, (_, n) => n);
const MANTICORE_PIECES = upTo(MANTICORE_ARMOR.pieces);
const MISSING_RECIPES = upTo(ALCHEMY_RECIPES);

// Picks one of the options the rules leave open: the encoder writes which one the build holds, the
// decoder reads it back.
type Choose = <T>(options: readonly T[], held: T) => T;

// Walks the ranks of the skills in the trees that have points.
type SkillWalk = (build: Build, choose: Choose, usedTrees: ReadonlySet<TreeName>) => void;

const chooseRank = (build: Build, choose: Choose, skill: Skill): void => {
  const rank = choose(RANKS, build.rank(skill));
  for (let added = build.rank(skill); added < rank; added++) build.addPoint(skill);
};

type Digit = readonly [value: number, base: number];

const pack = (digits: readonly Digit[]): bigint =>
  digits.reduceRight((value, [digit, base]) => value * BigInt(base) + BigInt(digit), 0n);

const toBase64Url = (value: bigint): string => {
  if (value === 0n) return ALPHABET.charAt(0);
  let text = '';
  for (let rest = value; rest > 0n; rest /= 64n) text = ALPHABET.charAt(Number(rest % 64n)) + text;
  return text;
};

const fromBase64Url = (text: string): bigint | null => {
  if (text.length === 0 || text.length > MAX_BODY_LENGTH || !/^[A-Za-z0-9_-]+$/.test(text))
    return null;
  // A leading zero digit would be a second spelling of the same number.
  if (text.length > 1 && text.startsWith(ALPHABET.charAt(0))) return null;
  let value = 0n;
  for (const char of text) value = value * 64n + BigInt(ALPHABET.indexOf(char));
  return value;
};

// Orders items so that each comes after everything it requires, otherwise keeping their order.
function requirementsFirst<T>(items: readonly T[], requires: (item: T) => readonly T[]): T[] {
  const ordered: T[] = [];
  const pending = [...items];
  while (pending.length > 0) {
    const next = pending.findIndex((item) =>
      requires(item).every((required) => ordered.includes(required) || !items.includes(required)),
    );
    if (next < 0) throw new Error('The requirements form a cycle');
    ordered.push(...pending.splice(next, 1));
  }
  return ordered;
}

// A build code is one mixed-radix number in base64url. The digits follow the build field by
// field, and each field offers only what the rules of Build allow once the fields before it are known:
// a rank only for a skill that is available, a slot only the learned skills it accepts and that no
// earlier slot holds. A field with a single option costs nothing, and empty fields at the end cost
// nothing either, so a code is only as long as the build is full.
export function createBuildCodec(catalog: Catalog): BuildCodec {
  const researchable = catalog.mutations.filter((mutation) => !mutation.innate);
  const mutations = requirementsFirst(researchable, (mutation) =>
    researchable.filter((other) => mutation.requires.includes(other.id)),
  );
  const mutagenIds = catalog.mutagens.map((mutagen) => mutagen.id);
  const decodeLegacy = createLegacyDecoder(catalog);

  // Offers a skill once a skill walked before opens it, pass after pass, so links that open both ways
  // need no order. A skill nothing learned opens is never offered.
  const walkOpenedSkills: SkillWalk = (build, choose, usedTrees) => {
    const walked = new Set<Skill>();
    const opened = (skill: Skill): boolean =>
      skill.requires.length === 0 ||
      skill.requires.some((other) => walked.has(other) && build.rank(other) > 0);
    for (let more = true; more;) {
      more = false;
      for (const skill of catalog.skills) {
        if (walked.has(skill) || !usedTrees.has(skill.tree) || !opened(skill)) continue;
        walked.add(skill);
        more = true;
        chooseRank(build, choose, skill);
      }
    }
  };

  // The unmarked codes read every link one way, its first skill opening the second, and walk the
  // skills in the order that allows.
  const oneWayParents = new Map(catalog.skills.map((skill): [Skill, Skill[]] => [skill, []]));
  for (const tree of catalog.trees) {
    for (const [first, second] of tree.links) oneWayParents.get(second)?.push(first);
  }
  const parentsOf = (skill: Skill): readonly Skill[] => oneWayParents.get(skill) ?? [];
  const oneWayOrder = requirementsFirst(catalog.skills, parentsOf);
  const walkOneWaySkills: SkillWalk = (build, choose, usedTrees) => {
    for (const skill of oneWayOrder) {
      const parents = parentsOf(skill);
      if (!usedTrees.has(skill.tree)) continue;
      if (parents.length > 0 && !parents.some((parent) => build.rank(parent) > 0)) continue;
      chooseRank(build, choose, skill);
    }
  };

  // The encoder walks a copy of a full build, the decoder an empty one that the walk fills in.
  function walk(build: Build, walkSkills: SkillWalk, choose: Choose): void {
    const usedTrees = new Set<TreeName>();
    for (const tree of catalog.trees) {
      if (choose(FLAGS, build.treePoints(tree.name) > 0)) usedTrees.add(tree.name);
    }
    walkSkills(build, choose, usedTrees);
    for (const mutation of mutations) {
      const researched = build.isResearched(mutation.id);
      if (!researched && !build.canResearch(mutation.id)) continue;
      if (choose(FLAGS, researched)) build.research(mutation.id);
    }
    const slottable = catalog.mutations.filter((mutation) => build.canSlotMutation(mutation.id));
    const slotted = choose(
      [null, ...slottable.map((mutation) => mutation.id)],
      build.slottedMutation,
    );
    if (slotted !== null) build.slotMutation(slotted);
    for (let index = 0; index < build.slotCount; index++) {
      const candidates = catalog.skills.filter((skill) => {
        const slot = build.slotOf(skill);
        return build.slotAccepts(index, skill) && (slot < 0 || slot >= index);
      });
      const skill = choose([null, ...candidates], build.slotAt(index));
      if (skill !== null) build.placeSkill(skill, index);
    }
    for (let group = 0; group < MUTAGEN_GROUPS; group++) {
      const id = choose([null, ...mutagenIds], build.mutagenAt(group));
      if (id !== null) build.placeMutagen(id, group);
    }
    // The toxicity plan comes last, so codes written before it existed keep meaning the same build.
    const plan = build.toxicityPlan;
    for (const potion of catalog.potions) {
      plan.setPotionTier(potion, choose(upTo(potion.tiers.length), plan.potionTier(potion)));
    }
    for (const decoction of catalog.decoctions) {
      if (choose(FLAGS, plan.isDecoctionActive(decoction))) plan.activateDecoction(decoction);
    }
    // The pieces the build wears, so a code made with Manticore armor carries them for older readers.
    plan.setManticorePieces(choose(MANTICORE_PIECES, build.manticorePieces));
    plan.setKnownRecipes(
      ALCHEMY_RECIPES - choose(MISSING_RECIPES, ALCHEMY_RECIPES - plan.knownRecipes),
    );
    // The gear comes after the toxicity plan for the same reason. A slot names the school by its final
    // item and fills that item's sockets, and the version of each item comes at the very end, the final
    // one first, so the codes 2.6 wrote with final items only keep their meaning.
    const finalOf = (item: GearItemData): GearItemData => catalog.versions(item).at(-1) ?? item;
    for (const slot of GEAR_SLOTS) {
      const worn = build.gear.itemAt(slot);
      const item = choose(
        [null, ...catalog.finalGear.filter((each) => each.slot === slot)],
        worn === null ? null : finalOf(worn),
      );
      if (item === null) continue;
      if (worn === null) build.gear.equip(slot, item);
      const words = catalog.enchantments.filter((word) => holdsEnchantment(item, word));
      const word = choose([null, ...words], build.gear.enchantmentAt(slot));
      if (word !== null) {
        build.gear.enchant(slot, word);
        continue;
      }
      const fitting = catalog.upgrades.filter((upgrade) => upgrade.kind === upgradeKind(slot));
      for (let socket = 0; socket < item.sockets; socket++) {
        const upgrade = choose([null, ...fitting], build.gear.upgradeAt(slot, socket));
        if (upgrade !== null) build.gear.setUpgrade(slot, socket, upgrade);
      }
    }
    for (const slot of GEAR_SLOTS) {
      const worn = build.gear.itemAt(slot);
      if (worn !== null)
        build.gear.equip(slot, choose([...catalog.versions(worn)].reverse(), worn));
    }
  }

  function encodeBody(build: Build, walkSkills: SkillWalk): string {
    const digits: Digit[] = [];
    walk(build.clone(), walkSkills, (options, held) => {
      const index = options.indexOf(held);
      if (index < 0) throw new Error('The build holds something its own rules do not allow');
      digits.push([index, options.length]);
      return held;
    });
    return toBase64Url(pack(digits));
  }

  function decodeBody(body: string, walkSkills: SkillWalk): Build | null {
    const value = fromBase64Url(body);
    if (value === null) return null;
    let rest = value;
    const build = new Build(catalog);
    walk(build, walkSkills, (options) => {
      const base = BigInt(options.length);
      const option = options[Number(rest % base)];
      rest /= base;
      if (option === undefined) throw new Error('A digit is always below its base');
      return option;
    });
    // Only the code a build encodes back to is accepted, so a tree flagged without points is refused.
    return rest === 0n && encodeBody(build, walkSkills) === body ? build : null;
  }

  function decode(text: string): Build | null {
    const code = text.trim();
    if (code.startsWith(LEGACY_PREFIX)) {
      const snapshot = decodeLegacy(code.slice(LEGACY_PREFIX.length));
      return snapshot === null ? null : Build.fromSnapshot(catalog, snapshot);
    }
    if (code.startsWith(MARK)) return decodeBody(code.slice(MARK.length), walkOpenedSkills);
    const body = code.startsWith(MARKER_2_1_0) ? code.slice(MARKER_2_1_0.length) : code;
    return decodeBody(body, walkOneWaySkills);
  }

  return { encode: (build) => MARK + encodeBody(build, walkOpenedSkills), decode };
}
