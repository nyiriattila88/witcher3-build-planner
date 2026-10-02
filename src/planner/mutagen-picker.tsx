import type { DragEvent, JSX } from 'react';
import type { Mutagen } from '../catalog/catalog';
import { backgroundUrl, mutagenColour, mutagenEffect, mutagenLabel } from './appearance';
import type { DragItem } from './drag-and-drop';
import { PANE_WIDTH } from './geometry';

type MutagenPickerProps = {
  readonly mutagens: readonly Mutagen[];
  readonly onHover: (mutagen: Mutagen) => void;
  readonly onDragStart: (item: DragItem, event: DragEvent) => void;
};

export function MutagenPicker({ mutagens, onHover, onDragStart }: MutagenPickerProps): JSX.Element {
  return (
    <div
      className="pane-content"
      style={{
        width: PANE_WIDTH,
        backgroundImage: `url("${backgroundUrl('mutagens')}")`,
        backgroundSize: '100% 100%',
      }}
    >
      <div className="mutagen-grid">
        {mutagens.map((mutagen) => (
          <div key={mutagen.id}>
            <div
              className="mutagen"
              style={{ background: mutagenColour(mutagen) }}
              draggable
              aria-label={mutagen.name}
              onMouseEnter={() => {
                onHover(mutagen);
              }}
              onDragStart={(event) => {
                onDragStart({ kind: 'mutagen', mutagen: mutagen.id, from: null }, event);
              }}
            >
              <span>{mutagenLabel(mutagen)}</span>
            </div>
            <div className="mutagen-effect">{mutagenEffect(mutagen, mutagen.bonus)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
