import type { CSSProperties, JSX } from 'react';
import type { Catalog, Mutation } from '../catalog/catalog';
import { mutationMetaText } from './appearance';

type MutationTooltipProps = {
  readonly mutation: Mutation;
  readonly catalog: Catalog;
  readonly placement: CSSProperties;
};

// The tooltip of a mutation beside its disc, the way a skill has one in its tree.
export function MutationTooltip({
  mutation,
  catalog,
  placement,
}: MutationTooltipProps): JSX.Element {
  return (
    <div className="game-tooltip" style={placement} role="tooltip">
      <div className="game-tooltip-head">
        <b>{mutation.name}</b>
        <span>{mutationMetaText(mutation, catalog)}</span>
      </div>
      <p className="game-tooltip-label">{mutation.description}</p>
    </div>
  );
}
