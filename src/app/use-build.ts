import { useCallback, useEffect, useMemo, useState } from 'react';
import { Build } from '../build/build';
import type { BuildCodec } from '../build/build-code';
import type { Catalog } from '../catalog/catalog';
import { buildCodeIn, type BuildAddress } from './build-address';

export type BuildState = {
  readonly build: Build;
  readonly code: string;
  // The page address that opens this build.
  readonly link: string;
  // Runs a change on a copy of the build, so React sees a new value.
  readonly apply: (change: (draft: Build) => void) => void;
  // Takes a build code or a shared link. Returns false when the text holds no build code.
  readonly load: (text: string) => boolean;
  readonly reset: () => void;
};

export function useBuild(catalog: Catalog, codec: BuildCodec, address: BuildAddress): BuildState {
  const [build, setBuild] = useState(() => codec.decode(address.code()) ?? new Build(catalog));
  const code = useMemo(() => codec.encode(build), [codec, build]);
  // An empty build keeps the plain page address.
  const shared = build.isEmpty() ? null : code;

  useEffect(() => {
    address.show(shared);
  }, [address, shared]);

  const apply = useCallback((change: (draft: Build) => void) => {
    setBuild((current) => {
      const draft = current.clone();
      change(draft);
      return draft;
    });
  }, []);

  const load = useCallback(
    (text: string) => {
      const loaded = codec.decode(buildCodeIn(text));
      if (loaded === null) return false;
      setBuild(loaded);
      return true;
    },
    [codec],
  );

  const reset = useCallback(() => {
    setBuild(new Build(catalog));
  }, [catalog]);

  return { build, code, link: address.linkTo(shared), apply, load, reset };
}
