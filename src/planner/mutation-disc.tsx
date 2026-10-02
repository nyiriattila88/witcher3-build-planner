import type { JSX } from 'react';
import type { Mutation } from '../catalog/catalog';
import { mutationColour, mutationIconUrl } from './appearance';

// A mutation as the game draws it: its emblem on a disc of its colours. The innate one has no emblem
// of its own, its icon is the whole disc.
export function MutationDisc({ mutation }: { mutation: Mutation }): JSX.Element {
  if (mutation.innate) {
    return (
      <span className="disc innate">
        <img src={mutationIconUrl(mutation)} alt="" draggable={false} />
      </span>
    );
  }
  return (
    <span className="disc" style={{ color: mutationColour(mutation) }}>
      <img src={mutationIconUrl(mutation)} alt="" draggable={false} />
    </span>
  );
}
