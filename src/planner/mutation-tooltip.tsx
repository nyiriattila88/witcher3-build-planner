import type { CSSProperties, JSX } from 'react';
import type { Catalog, Mutation } from '../catalog/catalog';
import { mutationMetaText } from './game-text';
import { GameTooltip } from './game-tooltip';

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
    <GameTooltip
      title={mutation.name}
      subtitle={mutationMetaText(mutation, catalog)}
      placement={placement}
    >
      <p className="game-tooltip-label">{mutation.description}</p>
    </GameTooltip>
  );
}
