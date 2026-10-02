import type { Catalog } from '../catalog/catalog';
import { BASE_SLOTS, MUTAGEN_GROUPS } from './build';
import type { BuildSnapshot, SlotEntry } from './build-snapshot';

export const LEGACY_PREFIX = 'W3R1.';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// Reads the fixed-width codes of 1.x, so their links keep opening. Nothing writes this format any more:
// the skill ranks as base-4 digits, three per character, then every slot as skill index + 1 (two
// characters), every mutagen group as mutagen index + 1, the research bitmask (two characters) and the
// slotted mutation's index + 1.
export function createLegacyDecoder(catalog: Catalog): (body: string) => BuildSnapshot | null {
  const skills = catalog.skills;
  const mutagenIds = catalog.mutagens.map((mutagen) => mutagen.id);
  const mutationIds = catalog.mutations.filter((mutation) => !mutation.innate).map((m) => m.id);
  const slotCount = BASE_SLOTS + catalog.extraSlotUnlocks.length;
  const rankChars = Math.ceil(skills.length / 3);
  const bodyLength = rankChars + slotCount * 2 + MUTAGEN_GROUPS + 2 + 1;

  return (body) => {
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
  };
}
