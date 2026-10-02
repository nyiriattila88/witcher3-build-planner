import { useCallback, useEffect, useMemo, useState } from 'react';
import { Build } from '../build/build';
import type { BuildCodec } from '../build/build-code';
import { parseSnapshot } from '../build/build-snapshot';
import type { Catalog } from '../catalog/catalog';
import type { BuildStorage } from './build-storage';

export type BuildState = {
  readonly build: Build;
  readonly code: string;
  // Runs a change on a copy of the build, so React sees a new value.
  readonly apply: (change: (draft: Build) => void) => void;
  // Returns false when the text is not a build code.
  readonly load: (code: string) => boolean;
  readonly reset: () => void;
};

// A code in the URL wins over the saved build, so a shared link opens exactly that build.
function initialBuild(catalog: Catalog, codec: BuildCodec, storage: BuildStorage): Build {
  const snapshot = codec.decode(storage.sharedCode()) ?? parseSnapshot(storage.savedSnapshot());
  return snapshot === null ? new Build(catalog) : Build.fromSnapshot(catalog, snapshot);
}

export function useBuild(catalog: Catalog, codec: BuildCodec, storage: BuildStorage): BuildState {
  const [build, setBuild] = useState(() => initialBuild(catalog, codec, storage));
  const code = useMemo(() => codec.encode(build), [codec, build]);

  useEffect(() => {
    storage.save(build.toSnapshot(), code);
  }, [storage, build, code]);

  const apply = useCallback((change: (draft: Build) => void) => {
    setBuild((current) => {
      const draft = current.clone();
      change(draft);
      return draft;
    });
  }, []);

  const load = useCallback(
    (text: string) => {
      const snapshot = codec.decode(text);
      if (snapshot === null) return false;
      setBuild(Build.fromSnapshot(catalog, snapshot));
      return true;
    },
    [catalog, codec],
  );

  const reset = useCallback(() => {
    setBuild(new Build(catalog));
  }, [catalog]);

  return { build, code, apply, load, reset };
}
