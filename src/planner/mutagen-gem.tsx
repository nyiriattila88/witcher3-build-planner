import type { JSX } from 'react';
import type { Mutagen } from '../catalog/catalog';
import { mutagenIconUrl } from './asset-urls';
import { mutagenColour } from './colours';
import { mutagenLabel } from './game-text';

// The inside of a mutagen diamond: the in-game orb and the name under it.
export function MutagenGem({ mutagen }: { mutagen: Mutagen }): JSX.Element {
  return (
    <span className="gem" style={{ color: mutagenColour(mutagen) }}>
      <img src={mutagenIconUrl(mutagen)} alt="" draggable={false} />
      <span className="gem-name">{mutagenLabel(mutagen)}</span>
    </span>
  );
}
