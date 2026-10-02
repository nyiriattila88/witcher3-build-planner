// A build by names, the form a 1.x build code decodes to. Build.fromSnapshot checks every name.
export type SlotEntry = { readonly tree: string; readonly name: string };

export type BuildSnapshot = {
  readonly points: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly slots: readonly (SlotEntry | null)[];
  readonly mutagens: readonly (string | null)[];
  readonly researched: readonly string[];
  readonly mutation: string | null;
};
