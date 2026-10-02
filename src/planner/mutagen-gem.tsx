import type { JSX } from 'react';
import type { Mutagen } from '../catalog/catalog';
import { mutagenColour, mutagenIconUrl, mutagenLabel } from './appearance';

// The inside of a mutagen diamond: the in-game orb and the name under it.
export function MutagenGem({ mutagen }: { mutagen: Mutagen }): JSX.Element {
  return (
    <span className="gem" style={{ color: mutagenColour(mutagen) }}>
      <img src={mutagenIconUrl(mutagen)} alt="" draggable={false} />
      <span className="gem-name">{mutagenLabel(mutagen)}</span>
    </span>
  );
}
