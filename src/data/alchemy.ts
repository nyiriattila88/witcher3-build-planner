// Potions and decoctions with their values since patch 4.0, from The Witcher Wiki. The Remastered patch
// notes list no alchemy changes, so these values stand for it too.

type ElixirTier = {
  readonly toxicity: number;
  // In seconds, null for an effect that is instant.
  readonly duration: number | null;
  readonly effects: readonly string[];
};

export type PotionData = {
  readonly name: string;
  // The base, enhanced and superior version, or the one version a potion has.
  readonly tiers: readonly [ElixirTier, ...ElixirTier[]];
};

export type DecoctionData = ElixirTier & { readonly name: string };

export const BASE_MAX_TOXICITY = 100;
// Since patch 4.0 an overdose starts above half of the maximum Toxicity.
export const SAFE_TOXICITY_SHARE = 0.5;
// Every alchemy formula of the game, which is what Acquired Tolerance counts: 148 in the base game, 150
// with Hearts of Stone and 167 with Blood and Wine, as players measured it since patch 4.0.
export const ALCHEMY_RECIPES = 167;
// Each piece of Manticore armor raises maximum Toxicity, by 5 since patch 4.0.
export const MANTICORE_ARMOR = { pieces: 4, toxicity: 5 } as const;

export const POTIONS: readonly PotionData[] = [
  {
    name: 'Bear pheromones',
    tiers: [{ toxicity: 15, duration: 90, effects: ['Bears will not attack the witcher.'] }],
  },
  {
    name: 'Black Blood',
    tiers: [
      {
        toxicity: 25,
        duration: 30,
        effects: [
          "Witcher's blood injures vampires and necrophages when they wound him.",
          '15% Damage returned',
        ],
      },
      {
        toxicity: 25,
        duration: 45,
        effects: [
          "Witcher's blood injures and knocks back vampires and necrophages when they wound him.",
          '20% Damage returned',
        ],
      },
      {
        toxicity: 25,
        duration: 60,
        effects: [
          "Vampires and necrophages start Bleeding when near the witcher. In addition, the witcher's blood injures and knocks them back when they wound him.",
          '30% Damage returned',
        ],
      },
    ],
  },
  {
    name: 'Blizzard',
    tiers: [
      {
        toxicity: 20,
        duration: 8,
        effects: ['Whenever you slay an enemy, time slows for a short period.', '20% Slowdown'],
      },
      {
        toxicity: 20,
        duration: 10,
        effects: [
          'Whenever you slay an enemy, time slows for a short period. Extended duration.',
          '30% Slowdown',
        ],
      },
      {
        toxicity: 20,
        duration: 12,
        effects: [
          "Whenever you slay an enemy, time slows for a short period. If 3 Adrenaline Points are available, during this period actions don't deplete Stamina.",
          '40% Slowdown',
        ],
      },
    ],
  },
  {
    name: 'Cat',
    tiers: [
      {
        toxicity: 15,
        duration: 60,
        effects: [
          'Grants sight in total darkness.',
          '25 Range of vision',
          'Increases critical hit chance.',
          '5% Critical hit chance',
        ],
      },
      {
        toxicity: 15,
        duration: 120,
        effects: [
          'Grants sight in total darkness and immunity to hypnosis. Extended duration.',
          '25 Range of vision',
          'Increases critical hit chance.',
          '7% Critical hit chance',
        ],
      },
      {
        toxicity: 15,
        duration: 180,
        effects: [
          'Grants sight in total darkness and immunity to hypnosis. Extended duration.',
          '25 Range of vision',
          'Increases critical hit chance.',
          '10% Critical hit chance',
        ],
      },
    ],
  },
  {
    name: 'Drowner pheromones',
    tiers: [{ toxicity: 15, duration: 90, effects: ['Drowners will not attack the witcher.'] }],
  },
  {
    name: 'Full Moon',
    tiers: [
      { toxicity: 25, duration: 60, effects: ['Increases maximum Vitality.', '300 Vitality'] },
      {
        toxicity: 25,
        duration: 90,
        effects: ['Increases maximum Vitality. Extended duration.', '650 Vitality'],
      },
      {
        toxicity: 25,
        duration: 180,
        effects: [
          'Increases maximum Vitality. Extended duration. Heals Vitality by an amount equal to current Toxicity.',
          '1000 Vitality',
        ],
      },
    ],
  },
  {
    name: 'Golden Oriole',
    tiers: [
      {
        toxicity: 25,
        duration: 60,
        effects: [
          'Grants immunity to poisons, neutralizes the effects of poisons already in bloodstream.',
        ],
      },
      {
        toxicity: 25,
        duration: 120,
        effects: [
          'Grants immunity to poisons, neutralizes the effects of poisons already in bloodstream. Extended duration.',
        ],
      },
      {
        toxicity: 25,
        duration: 180,
        effects: ['Extended duration. Poisons now heal instead of doing damage.'],
      },
    ],
  },
  {
    name: 'Killer Whale',
    tiers: [
      {
        toxicity: 15,
        duration: 180,
        effects: [
          'Increases breath supply while underwater by 50% and improves vision while diving.',
          '50% Breath',
        ],
      },
    ],
  },
  {
    name: 'Maribor Forest',
    tiers: [
      {
        toxicity: 20,
        duration: 30,
        effects: ['Accelerates the generation of Adrenaline Points.', '0.15 Adrenaline Point gain'],
      },
      {
        toxicity: 20,
        duration: 60,
        effects: [
          'Accelerates the generation of Adrenaline Points. Extended duration.',
          '0.15 Adrenaline Point gain',
        ],
      },
      {
        toxicity: 20,
        duration: 90,
        effects: [
          'Accelerates the generation of Adrenaline Points. Extended duration. Grants 1 Adrenaline Point upon consumption.',
          '0.15 Adrenaline Point gain',
        ],
      },
    ],
  },
  {
    name: 'Nekker pheromones',
    tiers: [{ toxicity: 15, duration: 90, effects: ['Nekkers will not attack the witcher.'] }],
  },
  {
    name: "Petri's Philter",
    tiers: [
      { toxicity: 25, duration: 30, effects: ['Increases Sign intensity.', '15% Sign intensity'] },
      {
        toxicity: 25,
        duration: 60,
        effects: ['Increases Sign intensity. Extended duration.', '20% Sign intensity'],
      },
      {
        toxicity: 25,
        duration: 90,
        effects: [
          'Increases Sign intensity. Extended duration. Signs always apply their special effects.',
          '25% Sign intensity',
        ],
      },
    ],
  },
  {
    name: 'Swallow',
    tiers: [
      {
        toxicity: 20,
        duration: 20,
        effects: [
          'Accelerates Vitality regeneration. Vitality regeneration pauses for 2 seconds upon receiving damage.',
          '40 Vitality regeneration',
          '40 Vitality regeneration per enemy killed during combat',
        ],
      },
      {
        toxicity: 20,
        duration: 20,
        effects: [
          'Accelerates Vitality regeneration. Vitality regeneration pauses for 2 seconds upon receiving damage.',
          '65 Vitality regeneration',
          '65 Vitality regeneration during combat',
        ],
      },
      {
        toxicity: 20,
        duration: 20,
        effects: [
          'Accelerates Vitality regeneration. Taking damage does not interrupt regeneration.',
          '80 Vitality regeneration',
          '80 Vitality regeneration during combat',
        ],
      },
    ],
  },
  {
    name: 'Tawny Owl',
    tiers: [
      {
        toxicity: 20,
        duration: 30,
        effects: ['Accelerates Stamina regeneration.', '5% Stamina regeneration in combat'],
      },
      {
        toxicity: 20,
        duration: 45,
        effects: [
          'Accelerates Stamina regeneration. Extended duration.',
          '8% Stamina regeneration in combat',
        ],
      },
      {
        toxicity: 20,
        duration: 60,
        effects: [
          'Accelerates Stamina regeneration. Extended duration. Never expires at night.',
          '10% Stamina regeneration in combat',
        ],
      },
    ],
  },
  {
    name: 'Thunderbolt',
    tiers: [
      { toxicity: 25, duration: 30, effects: ['Increases Attack Power.', '30% Attack power'] },
      {
        toxicity: 25,
        duration: 60,
        effects: ['Increases Attack Power. Extended duration.', '30% Attack power'],
      },
      {
        toxicity: 25,
        duration: 90,
        effects: [
          'Extended duration. Grants 100% critical hit chance during storms.',
          '35% Attack power',
        ],
      },
    ],
  },
  {
    name: 'White Honey',
    tiers: [
      {
        toxicity: 0,
        duration: null,
        effects: ['Clears Toxicity and cancels all active potion effects.'],
      },
      {
        toxicity: 0,
        duration: null,
        effects: ['Clears Toxicity and cancels all active potion effects.'],
      },
      {
        toxicity: 0,
        duration: null,
        effects: ['Clears Toxicity and cancels all active potion effects.'],
      },
    ],
  },
  {
    name: "White Raffard's Decoction",
    tiers: [
      {
        toxicity: 25,
        duration: null,
        effects: ['Immediately restores a portion of Vitality.', '35% Vitality'],
      },
      {
        toxicity: 25,
        duration: null,
        effects: ['Immediately restores a large portion of Vitality.', '60% Vitality'],
      },
      {
        toxicity: 25,
        duration: 3,
        effects: [
          'Restores Vitality immediately and fully. Grants immunity to damage for a short duration.',
          '100% Vitality',
        ],
      },
    ],
  },
];

export const DECOCTIONS: readonly DecoctionData[] = [
  {
    name: 'Alghoul decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Adrenaline Points are generated more quickly than normal until the first successful enemy attack.',
      '50% Adrenaline Point gain',
    ],
  },
  {
    name: 'Ancient leshen decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Each Sign cast increases Stamina regeneration for the remainder of the fight.',
      '2 Stamina regeneration in combat',
    ],
  },
  {
    name: 'Arachas decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Reduces damage received based on armor and inventory weight: less weight carried and lighter armor means less damage is taken.',
    ],
  },
  {
    name: 'Archgriffin decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      "If any Stamina is available, strong attacks consume all of it and reduce the struck foe's Vitality by 5% after their normal damage is calculated.",
    ],
  },
  {
    name: 'Basilisk decoction',
    toxicity: 40,
    duration: 5760,
    effects: [
      'Applies a buff increasing the intensity of a randomly selected Sign at dusk and dawn. Lasts longer than other mutagen decoctions.',
    ],
  },
  {
    name: 'Chort decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Provides complete resistance to the Stagger effect and reduces the Knock-down effect to Stagger.',
    ],
  },
  {
    name: 'Cockatrice decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['All alchemy creations can be used one additional time.'],
  },
  {
    name: 'Doppler decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Increases critical hit damage when attacking from behind.', '50% Increased damage'],
  },
  {
    name: 'Earth elemental decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      "Increases the witcher's resistance to Vitality-depleting critical effects applied during combat. The resistance level rises the longer the critical effect is applied.",
    ],
  },
  {
    name: 'Ekhidna decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Performing actions that consume Stamina regenerates Vitality.'],
  },
  {
    name: 'Ekimmara decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Damage dealt to foes regenerates Vitality.', '10% Vitality drain'],
  },
  {
    name: 'Fiend decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Increases the amount of weight the witcher can carry without being overburdened.',
      '20 Maximum inventory weight',
    ],
  },
  {
    name: 'Foglet decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Increases Sign Intensity during cloudy weather.', '25% Sign intensity'],
  },
  {
    name: 'Forktail decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Combining various attacks (strong strikes, fast strikes, Signs) grants a bonus that increases Attack Power for the next attack mounted or Sign Intensity for the next Sign cast.',
      '50% Attack power',
      '50% Sign intensity',
    ],
  },
  {
    name: 'Grave hag decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Each foe slain accelerates Vitality regeneration for the duration of the battle.',
      '10 Vitality regeneration per enemy killed during combat',
      'Before',
      '5 Vitality regeneration during combat',
    ],
  },
  {
    name: 'Griffin decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Taking damage raises damage resistance (up to an upper limit) for the remainder of the fight.',
      '1% Resistance to slashing damage',
      '1% Resistance to piercing damage',
      '1% Resistance to bludgeoning damage',
      '1% Resistance to damage from monsters',
      '1% Resistance to elemental damage',
    ],
  },
  {
    name: 'Katakan decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Increases critical hit chance.'],
  },
  {
    name: 'Leshen decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'A portion of the damage dealt by enemies is reflected back on the attacker.',
      '10 Damage returned',
    ],
  },
  {
    name: 'Nekker warrior decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Mounts never panic. 50% increase to mounted combat damage.', '50% Attack power'],
  },
  {
    name: 'Nightwraith decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      "Geralt's maximum Vitality is increased with each foe killed. This increase lasts until he meditates or fast travels.",
      '50 Vitality',
    ],
  },
  {
    name: 'Noonwraith decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Significantly limits the duration of Knockdown, Hypnosis, Stun and Blindness.'],
  },
  {
    name: 'Succubus decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Attack Power grows over the course of a fight until reaching a maximum threshold.',
      '1% Attack power',
    ],
  },
  {
    name: 'Troll decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Regenerates Vitality during and outside of combat.',
      '100 Vitality regeneration',
      '20 Vitality regeneration per enemy killed during combat',
      'Before',
      '20 Vitality regeneration during combat',
    ],
  },
  {
    name: 'Water hag decoction',
    toxicity: 50,
    duration: 1800,
    effects: ['Damage dealt is increased when Vitality is at its maximum.', '50% Increased damage'],
  },
  {
    name: 'Werewolf decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Significantly increases Stamina regeneration during a clear, moonlit night.',
      '50% Stamina regeneration in combat.',
      'Before',
      'Running, sprinting and jumping outside combat does not use Stamina.',
    ],
  },
  {
    name: 'Wraith decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Whenever a single hit drains more than a third of Vitality, a Quen shield is activated which protects against the next attack.',
    ],
  },
  {
    name: 'Wyvern decoction',
    toxicity: 50,
    duration: 1800,
    effects: [
      'Each blow landed increases Attack Power until either the fight ends or damage (other than that from Toxicity) is taken.',
      '1% Attack power',
    ],
  },
];
