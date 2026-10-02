import type { JSX } from 'react';
import { MAX_RANK } from '../build/build';

const PIPS = Array.from({ length: MAX_RANK }, (_, pip) => pip);

// The three dots under a skill icon, lit up to its rank, as the game shows them.
export function RankPips({ rank }: { rank: number }): JSX.Element {
  return (
    <span className="pips" aria-hidden="true">
      {PIPS.map((pip) => (
        <i key={pip} className={pip < rank ? 'lit' : undefined} />
      ))}
    </span>
  );
}
