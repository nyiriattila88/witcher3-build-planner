// Potions and decoctions with their values since patch 4.0, from The Witcher Wiki infoboxes and pages, and
// from Fextralife pages edited after 4.0 where the two disagree. The Remastered patch notes list no
// alchemy changes, so these values stand for it too.

type ElixirTier = {
  readonly toxicity: number;
  // In seconds, null for an effect that is instant.
  readonly duration: number | null;
  // The in-game description with its values written into the text.
  readonly effect: string;
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
    tiers: [{ toxicity: 15, duration: 90, effect: 'Bears will not attack the witcher.' }],
  },
  {
    name: 'Black Blood',
    tiers: [
      {
        toxicity: 25,
        duration: 30,
        effect:
          "Witcher's blood injures vampires and necrophages when they wound him, returning 15% of the damage.",
      },
      {
        toxicity: 25,
        duration: 45,
        effect:
          "Witcher's blood injures and knocks back vampires and necrophages when they wound him, returning 20% of the damage.",
      },
      {
        toxicity: 25,
        duration: 60,
        effect:
          "Vampires and necrophages start Bleeding when near the witcher. In addition, the witcher's blood injures and knocks them back when they wound him, returning 30% of the damage.",
      },
    ],
  },
  {
    name: 'Blizzard',
    tiers: [
      {
        toxicity: 20,
        duration: 8,
        effect: 'Whenever you slay an enemy, time slows by 20% for a short period.',
      },
      {
        toxicity: 20,
        duration: 10,
        effect: 'Whenever you slay an enemy, time slows by 30% for a short period.',
      },
      {
        toxicity: 20,
        duration: 12,
        effect:
          "Whenever you slay an enemy, time slows by 40% for a short period. If 3 Adrenaline Points are available, actions don't deplete Stamina during this period.",
      },
    ],
  },
  {
    name: 'Cat',
    tiers: [
      {
        toxicity: 15,
        duration: 60,
        effect:
          'Grants sight in total darkness with a range of vision of 25 and increases critical hit chance by 5%.',
      },
      {
        toxicity: 15,
        duration: 120,
        effect:
          'Grants sight in total darkness with a range of vision of 25 and immunity to hypnosis. Increases critical hit chance by 7%.',
      },
      {
        toxicity: 15,
        duration: 180,
        effect:
          'Grants sight in total darkness with a range of vision of 25 and immunity to hypnosis. Increases critical hit chance by 10%.',
      },
    ],
  },
  {
    name: 'Drowner pheromones',
    tiers: [{ toxicity: 15, duration: 90, effect: 'Drowners will not attack the witcher.' }],
  },
  {
    name: 'Full Moon',
    tiers: [
      { toxicity: 25, duration: 60, effect: 'Increases maximum Vitality by 300.' },
      { toxicity: 25, duration: 90, effect: 'Increases maximum Vitality by 650.' },
      {
        toxicity: 25,
        duration: 180,
        effect:
          'Increases maximum Vitality by 1000 and heals Vitality by an amount equal to current Toxicity.',
      },
    ],
  },
  {
    name: 'Golden Oriole',
    tiers: [
      {
        toxicity: 25,
        duration: 60,
        effect:
          'Grants immunity to poisons and neutralizes the effects of poisons already in the bloodstream.',
      },
      {
        toxicity: 25,
        duration: 120,
        effect:
          'Grants immunity to poisons and neutralizes the effects of poisons already in the bloodstream.',
      },
      { toxicity: 25, duration: 180, effect: 'Poisons heal instead of doing damage.' },
    ],
  },
  {
    name: 'Killer Whale',
    tiers: [
      {
        toxicity: 15,
        duration: 180,
        effect: 'Increases breath supply while underwater by 50% and improves vision while diving.',
      },
    ],
  },
  {
    name: 'Maribor Forest',
    tiers: [
      { toxicity: 20, duration: 30, effect: 'Raises Adrenaline Point gain by 0.15.' },
      { toxicity: 20, duration: 60, effect: 'Raises Adrenaline Point gain by 0.15.' },
      {
        toxicity: 20,
        duration: 90,
        effect:
          'Raises Adrenaline Point gain by 0.15 and grants 1 Adrenaline Point upon consumption.',
      },
    ],
  },
  {
    name: 'Nekker pheromones',
    tiers: [{ toxicity: 15, duration: 90, effect: 'Nekkers will not attack the witcher.' }],
  },
  {
    name: "Petri's Philter",
    tiers: [
      { toxicity: 25, duration: 30, effect: 'Increases Sign intensity by 15%.' },
      { toxicity: 25, duration: 60, effect: 'Increases Sign intensity by 20%.' },
      {
        toxicity: 25,
        duration: 90,
        effect: 'Increases Sign intensity by 25%, and Signs always apply their special effects.',
      },
    ],
  },
  {
    name: 'Swallow',
    tiers: [
      {
        toxicity: 20,
        duration: 20,
        effect:
          'Raises Vitality regeneration by 80, or by 40 during combat. Regeneration pauses for 2 seconds upon receiving damage.',
      },
      {
        toxicity: 20,
        duration: 20,
        effect:
          'Raises Vitality regeneration by 100, or by 65 during combat. Regeneration pauses for 2 seconds upon receiving damage.',
      },
      {
        toxicity: 20,
        duration: 20,
        effect:
          'Raises Vitality regeneration by 150, or by 80 during combat. Taking damage does not interrupt regeneration.',
      },
    ],
  },
  {
    name: 'Tawny Owl',
    tiers: [
      { toxicity: 20, duration: 30, effect: 'Accelerates Stamina regeneration in combat by 5%.' },
      { toxicity: 20, duration: 45, effect: 'Accelerates Stamina regeneration in combat by 8%.' },
      {
        toxicity: 20,
        duration: 60,
        effect: 'Accelerates Stamina regeneration in combat by 10%. Never expires at night.',
      },
    ],
  },
  {
    name: 'Thunderbolt',
    tiers: [
      { toxicity: 25, duration: 30, effect: 'Increases Attack Power by 30%.' },
      { toxicity: 25, duration: 60, effect: 'Increases Attack Power by 30%.' },
      {
        toxicity: 25,
        duration: 90,
        effect: 'Increases Attack Power by 35% and grants 100% critical hit chance during storms.',
      },
    ],
  },
  {
    name: 'White Honey',
    tiers: [
      {
        toxicity: 0,
        duration: null,
        effect: 'Clears Toxicity and cancels all active potion effects.',
      },
      {
        toxicity: 0,
        duration: null,
        effect: 'Clears Toxicity and cancels all active potion effects.',
      },
      {
        toxicity: 0,
        duration: null,
        effect: 'Clears Toxicity and cancels all active potion effects.',
      },
    ],
  },
  {
    name: "White Raffard's Decoction",
    tiers: [
      { toxicity: 25, duration: null, effect: 'Immediately restores 35% of Vitality.' },
      { toxicity: 25, duration: null, effect: 'Immediately restores 60% of Vitality.' },
      {
        toxicity: 25,
        duration: 3,
        effect:
          'Restores Vitality immediately and fully and grants immunity to damage for a short duration.',
      },
    ],
  },
];

export const DECOCTIONS: readonly DecoctionData[] = [
  {
    name: 'Alghoul decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Adrenaline Points are generated 50% faster than normal until the first successful enemy attack.',
  },
  {
    name: 'Ancient leshen decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Each Sign cast raises Stamina regeneration in combat by 2 for the remainder of the fight, with no limit.',
  },
  {
    name: 'Arachas decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Reduces damage received by up to 20%, based on armor and inventory weight: less weight carried and lighter armor means less damage is taken.',
  },
  {
    name: 'Archgriffin decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      "If any Stamina is available, strong attacks consume all of it and reduce the struck foe's Vitality by 5% after their normal damage is calculated.",
  },
  {
    name: 'Basilisk decoction',
    toxicity: 40,
    duration: 5760,
    effect:
      'At dawn and dusk (6:00), increases the intensity of a randomly selected Sign for 6 in-game hours. Lasts longer than other mutagen decoctions.',
  },
  {
    name: 'Chort decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Provides complete resistance to the Stagger effect and reduces the Knock-down effect to Stagger.',
  },
  {
    name: 'Cockatrice decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'All alchemy creations can be used one additional time.',
  },
  {
    name: 'Doppler decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Increases critical hit damage by 50% when attacking from behind.',
  },
  {
    name: 'Earth elemental decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Increases resistance to Vitality-depleting critical effects applied during combat, such as poison, bleeding and burning, by 10%. The resistance level rises the longer the critical effect is applied.',
  },
  {
    name: 'Ekhidna decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Each action that consumes Stamina regenerates 10% Vitality.',
  },
  {
    name: 'Ekimmara decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Damage dealt to foes regenerates Vitality equal to 10% of the damage.',
  },
  {
    name: 'Fiend decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Increases the amount of weight the witcher can carry without being overburdened by 20.',
  },
  {
    name: 'Foglet decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Increases Sign intensity by 25% during cloudy weather.',
  },
  {
    name: 'Forktail decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Combining various attacks (strong strikes, fast strikes, Signs) grants a bonus of 50% Attack Power for the next attack mounted or 50% Sign intensity for the next Sign cast.',
  },
  {
    name: 'Grave hag decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Each foe slain raises Vitality regeneration in combat by 10 for the duration of the battle, with no limit.',
  },
  {
    name: 'Griffin decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Each hit taken raises resistance to slashing, piercing, bludgeoning, monster and elemental damage by 1% for the remainder of the fight, up to 25%.',
  },
  {
    name: 'Katakan decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Increases critical hit chance by 10%.',
  },
  {
    name: 'Leshen decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'A portion of the damage dealt by enemies is reflected back on the attacker: 10 damage plus 10% of the damage taken.',
  },
  {
    name: 'Nekker warrior decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Mounts never panic, and mounted combat damage increases by 50%.',
  },
  {
    name: 'Nightwraith decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Each foe killed increases maximum Vitality by 50. The increase lasts until Geralt meditates or fast travels.',
  },
  {
    name: 'Noonwraith decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Significantly limits the duration of Knockdown, Hypnosis, Stun and Blindness.',
  },
  {
    name: 'Succubus decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Attack Power grows by 1% at a time over the course of a fight, up to 30%.',
  },
  {
    name: 'Troll decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Raises Vitality regeneration by 100, or by 20 during combat.',
  },
  {
    name: 'Water hag decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Damage dealt is increased by 50% while Vitality is at its maximum.',
  },
  {
    name: 'Werewolf decoction',
    toxicity: 50,
    duration: 1800,
    effect: 'Raises Stamina regeneration in combat by 50% during a clear, moonlit night.',
  },
  {
    name: 'Wraith decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Whenever a single hit drains more than a third of Vitality, a Quen shield is activated which protects against the next attack.',
  },
  {
    name: 'Wyvern decoction',
    toxicity: 50,
    duration: 1800,
    effect:
      'Each blow landed increases Attack Power by 1%, with no upper limit, until either the fight ends or damage (other than that from Toxicity) is taken.',
  },
];
