// The serialised form of a build: what the browser saves and what a build code decodes to.
export type SlotEntry = { readonly tree: string; readonly name: string };

export type BuildSnapshot = {
  readonly points: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly slots: readonly (SlotEntry | null)[];
  readonly mutagens: readonly (string | null)[];
  readonly researched: readonly string[];
  readonly mutation: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSlotEntry = (value: unknown): value is SlotEntry =>
  isRecord(value) && typeof value.tree === 'string' && typeof value.name === 'string';

const arrayOf = (value: unknown): readonly unknown[] => (Array.isArray(value) ? value : []);

// Checks the shape of a stored snapshot. Whether its names exist is up to Build.fromSnapshot.
export function parseSnapshot(value: unknown): BuildSnapshot | null {
  if (!isRecord(value)) return null;

  const points: Record<string, Record<string, number>> = {};
  if (isRecord(value.points)) {
    for (const [tree, ranks] of Object.entries(value.points)) {
      if (!isRecord(ranks)) continue;
      const treePoints: Record<string, number> = {};
      for (const [name, rank] of Object.entries(ranks)) {
        if (typeof rank === 'number') treePoints[name] = rank;
      }
      points[tree] = treePoints;
    }
  }

  return {
    points,
    slots: arrayOf(value.slots).map((entry) =>
      isSlotEntry(entry) ? { tree: entry.tree, name: entry.name } : null,
    ),
    mutagens: arrayOf(value.mutagens).map((id) => (typeof id === 'string' ? id : null)),
    researched: arrayOf(value.researched).filter((id) => typeof id === 'string'),
    mutation: typeof value.mutation === 'string' ? value.mutation : null,
  };
}
