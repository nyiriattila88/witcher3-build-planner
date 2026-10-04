import type { MouseEvent } from 'react';
import type { Skill } from '../catalog/catalog';
import type { PotionData } from '../data/alchemy';

// What a potion version or a decoction shows: its Toxicity, how long it lasts and what it does.
export type Elixir = PotionData['tiers'][number];

// Active, free to make active, or refused because it would take Toxicity above the maximum.
export type ElixirState = 'active' | 'available' | 'blocked';

export const elixirState = (active: boolean, allowed: boolean): ElixirState => {
  if (active) return 'active';
  return allowed ? 'available' : 'blocked';
};

export const TOO_TOXIC = 'Too toxic: it would take Toxicity above the maximum';

// The tooltips of the Toxicity tab. The tab draws them over its whole pane, so a tile never cuts
// one off.
export type ToxicityTips = {
  readonly showElixir: (event: MouseEvent, title: string, elixir: Elixir, hint: string) => void;
  readonly showSkill: (event: MouseEvent, skill: Skill, hint?: string) => void;
  readonly hide: () => void;
};
