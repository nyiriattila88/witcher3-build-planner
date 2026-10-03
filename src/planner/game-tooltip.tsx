import type { CSSProperties, JSX, ReactNode } from 'react';

type GameTooltipProps = {
  readonly title: string;
  // The line under the title, such as a rank or what the item is.
  readonly subtitle: string;
  readonly placement: CSSProperties;
  // What the pointer can do with it there, at the bottom.
  readonly hint?: string | undefined;
  readonly children: ReactNode;
};

// The frame the in-game tooltips share: the title with a line under it, the text, then the hint.
export function GameTooltip({
  title,
  subtitle,
  placement,
  hint,
  children,
}: GameTooltipProps): JSX.Element {
  return (
    <div className="game-tooltip" style={placement} role="tooltip">
      <div className="game-tooltip-head">
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
      {children}
      {hint !== undefined && <p className="game-tooltip-hint">{hint}</p>}
    </div>
  );
}
