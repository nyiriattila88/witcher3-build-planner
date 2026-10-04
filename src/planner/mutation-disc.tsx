import type { JSX } from 'react';
import type { Mutation } from '../catalog/catalog';
import { mutationIconUrl } from './asset-urls';

// A mutation as the game draws it: its disc in the mutation's colour, the emblem in a badge below.
export function MutationDisc({ mutation }: { mutation: Mutation }): JSX.Element {
  return <img className="disc" src={mutationIconUrl(mutation)} alt="" draggable={false} />;
}
