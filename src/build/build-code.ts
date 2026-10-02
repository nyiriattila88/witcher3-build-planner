import type { Catalog } from '../catalog/catalog';
import { BASE_SLOTS, MUTAGEN_GROUPS, type Build } from './build';
import type { BuildSnapshot, SlotEntry } from './build-snapshot';

export type BuildCodec = {
  readonly encode: (build: Build) => string;
  readonly decode: (text: string) => BuildSnapshot | null;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const PREFIX = 'W3R1.';

// A build code is "W3R1." and a fixed-width base64url body: the skill ranks as base-4 digits, three per
// character, then every slot as skill index + 1 (two characters), every mutagen group as mutagen
// index + 1, the research bitmask (two characters) and the slotted mutation's index + 1.
export function createBuildCodec(catalog: Catalog): BuildCodec {
  const skills = catalog.skills;
  const mutagenIds = catalog.mutagens.map((mutagen) => mutagen.id);
  const mutationIds = catalog.mutations.filter((mutation) => !mutation.innate).map((m) => m.id);
  const slotCount = BASE_SLOTS + catalog.extraSlotUnlocks.length;
  const rankChars = Math.ceil(skills.length / 3);
  const bodyLength = rankChars + slotCount * 2 + MUTAGEN_GROUPS + 2 + 1;

  const single = (value: number): string => ALPHABET.charAt(value);
  const double = (value: number): string =>
    ALPHABET.charAt(value >> 6) + ALPHABET.charAt(value & 63);

  function encode(build: Build): string {
    const ranks = skills.map((skill) => build.rank(skill));
    let body = '';
    for (let i = 0; i < ranks.length; i += 3) {
      body += single(16 * (ranks[i] ?? 0) + 4 * (ranks[i + 1] ?? 0) + (ranks[i + 2] ?? 0));
    }
    for (let i = 0; i < slotCount; i++) body += double((build.slotAt(i)?.index ?? -1) + 1);
    for (let group = 0; group < MUTAGEN_GROUPS; group++) {
      const id = build.mutagenAt(group);
      body += single(id === null ? 0 : mutagenIds.indexOf(id) + 1);
    }
    body += double(
      mutationIds.reduce((mask, id, bit) => (build.isResearched(id) ? mask | (1 << bit) : mask), 0),
    );
    const slotted = build.slottedMutation;
    body += single(slotted === null ? 0 : mutationIds.indexOf(slotted) + 1);
    return PREFIX + body;
  }

  function decode(text: string): BuildSnapshot | null {
    const code = text.trim();
    if (!code.startsWith(PREFIX)) return null;
    const body = code.slice(PREFIX.length);
    if (body.length !== bodyLength || !/^[A-Za-z0-9_-]*$/.test(body)) return null;

    const singleAt = (position: number): number => ALPHABET.indexOf(body.charAt(position));
    const doubleAt = (position: number): number => singleAt(position) * 64 + singleAt(position + 1);

    const points: Record<string, Record<string, number>> = {};
    skills.forEach((skill, i) => {
      // The first of three skills is the highest base-4 digit of its character.
      const rank = Math.floor(singleAt(Math.floor(i / 3)) / 4 ** (2 - (i % 3))) % 4;
      if (rank > 0) (points[skill.tree] ??= {})[skill.name] = rank;
    });
    let position = rankChars;
    const slots: (SlotEntry | null)[] = [];
    for (let i = 0; i < slotCount; i++, position += 2) {
      const skill = skills[doubleAt(position) - 1];
      slots.push(skill === undefined ? null : { tree: skill.tree, name: skill.name });
    }
    const mutagens: (string | null)[] = [];
    for (let group = 0; group < MUTAGEN_GROUPS; group++, position++) {
      mutagens.push(mutagenIds[singleAt(position) - 1] ?? null);
    }
    const mask = doubleAt(position);
    const mutation = mutationIds[singleAt(position + 2) - 1] ?? null;
    const researched = mutationIds.filter((_, bit) => (mask & (1 << bit)) !== 0);
    return { points, slots, mutagens, researched, mutation };
  }

  return { encode, decode };
}
