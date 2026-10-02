// Skill names and rank texts. Rank 1 is the in-game tooltip as transcribed by the Fextralife wiki and checked against
// Hack the Minotaur's remaster guide, ranks 2 and 3 take their values from LAMBKING's reference posts on r/witcher.
// The tree bonus of a rank is on its own line, as the game shows it.
// Build codes address skills by their position in this list: append new skills, never reorder them.

export type TreeName = 'Combat' | 'Signs' | 'Alchemy' | 'General';

type SkillData = {
  readonly name: string;
  readonly ranks: readonly [string, string, string];
};

export type SkillTreeData = {
  readonly tree: TreeName;
  readonly skills: readonly SkillData[];
};

export const SKILL_TREES: readonly SkillTreeData[] = [
  {
    tree: 'Combat',
    skills: [
      {
        name: 'Muscle Memory',
        ranks: [
          'After a successful dodge or roll, your next Fast Attack performed deals 30% additional damage.\nAdrenaline Point gain: +1%',
          'After a successful dodge or roll, your next two Fast Attacks performed in a row deal 30% additional damage.\nAdrenaline Point gain: +2%',
          'After a successful dodge or roll, your next three Fast Attacks performed in a row deal 30% additional damage.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Strength Training',
        ranks: [
          "Fast Attacks increase the next strong attack's damage by 15%.\nAdrenaline Point gain: +1%",
          "Fast Attacks increase the next strong attack's damage by 30%.\nAdrenaline Point gain: +2%",
          "Fast Attacks increase the next strong attack's damage by 45%.\nAdrenaline Point gain: +3%",
        ],
      },
      {
        name: 'Three Strikes',
        ranks: [
          'The third Fast or Strong Attack has a 20% chance to make the next attack even more powerful, but only if it is the same attack type as the last.\nAdrenaline Point gain: +1%',
          'The third Fast or Strong Attack has a 40% chance to make the next attack even more powerful, but only if it is the same attack type as the last.\nAdrenaline Point gain: +2%',
          'The third Fast or Strong Attack has a 60% chance to make the next attack even more powerful, but only if it is the same attack type as the last.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Crushing Blow',
        ranks: [
          'A Strong Attack has a 20% chance to increase the damage dealt by the next 2 Strong Attacks by 50%.\nAdrenaline Point gain: +1%',
          'A Strong Attack has a 40% chance to increase the damage dealt by the next 2 Strong Attacks by 50%.\nAdrenaline Point gain: +2%',
          'A Strong Attack has a 60% chance to increase the damage dealt by the next 2 Strong Attacks by 50%.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Sunder Armor',
        ranks: [
          'Strong Attacks sunder enemy Armor, reducing enemy damage resistance by 10%. Stacks up to 1 time(s).\nAdrenaline Point gain: +1%',
          'Strong Attacks sunder enemy Armor, reducing enemy damage resistance by 10%. Stacks up to 2 time(s).\nAdrenaline Point gain: +2%',
          'Strong Attacks sunder enemy Armor, reducing enemy damage resistance by 10%. Stacks up to 3 time(s).\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Rend',
        ranks: [
          'Deals additional damage proportional to Stamina consumed. Ignores enemy defenses. Adrenaline Points increase total damage by 10% per point upon hitting an enemy.\nAdrenaline Point gain: +1%',
          'Deals additional damage proportional to Stamina consumed. Ignores enemy defenses. Adrenaline Points increase total damage by 20% per point upon hitting an enemy.\nAdrenaline Point gain: +2%',
          'Deals additional damage proportional to Stamina consumed. Ignores enemy defenses. Adrenaline Points increase total damage by 30% per point upon hitting an enemy.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Deadly Precision',
        ranks: [
          'All attacks have a chance to make the next Strong Attack instantly kill an enemy. Enemies immune to this effect generate 0.1 Adrenaline instead.\nAdrenaline Point gain: +1%',
          'All attacks have a chance to make the next Strong Attack instantly kill an enemy. Enemies immune to this effect generate 0.2 Adrenaline instead.\nAdrenaline Point gain: +2%',
          'All attacks have a chance to make the next Strong Attack instantly kill an enemy. Enemies immune to this effect generate 0.3 Adrenaline instead.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Razor Focus',
        ranks: [
          'Gain 1 Adrenaline point upon entering combat. Increases Adrenaline generation from weapon strikes by 10%.\nAdrenaline Point gain: +1%',
          'Gain 1 Adrenaline point upon entering combat. Increases Adrenaline generation from weapon strikes by 20%.\nAdrenaline Point gain: +2%',
          'Gain 1 Adrenaline point upon entering combat. Increases Adrenaline generation from weapon strikes by 30%.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Undying',
        ranks: [
          'When Vitality reaches 0, immediately consumes Adrenaline points to restore 10% of Vitality per point. Can only be used once every 30 seconds.\nAdrenaline Point gain: +1%',
          'When Vitality reaches 0, immediately consumes Adrenaline points to restore 10% of Vitality per point, increased by 33%. Can only be used once every 30 seconds.\nAdrenaline Point gain: +2%',
          'When Vitality reaches 0, immediately consumes Adrenaline points to restore 10% of Vitality per point, increased by 67%. Can only be used once every 30 seconds.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Fleet Footed',
        ranks: [
          'Reduces damage received while dodging by 33%.\nAdrenaline Point gain: +1%',
          'Reduces damage received while dodging by 67%.\nAdrenaline Point gain: +2%',
          'Reduces damage received while dodging by 100%.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Whirl',
        ranks: [
          'A spinning attack that strikes all enemies in your immediate vicinity. Maintaining the attack consumes Stamina and Adrenaline.\nAdrenaline Point gain: +1%',
          'A spinning attack that strikes all enemies in your immediate vicinity. Maintaining the attack consumes Stamina and Adrenaline. Cost reduced by 33%.\nAdrenaline Point gain: +2%',
          'A spinning attack that strikes all enemies in your immediate vicinity. Maintaining the attack consumes Stamina and Adrenaline. Cost reduced by 50%.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Counterattack',
        ranks: [
          'After a successful counterattack or dodge, the next attack deals 33% additional damage. Damage dealt by crossbows is multiplied by 2.\nAdrenaline Point gain: +1%',
          'After a successful counterattack or dodge, the next attack deals 67% additional damage. Damage dealt by crossbows is multiplied by 2.\nAdrenaline Point gain: +2%',
          'After a successful counterattack or dodge, the next attack deals 100% additional damage. Damage dealt by crossbows is multiplied by 2.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Flood of Anger',
        ranks: [
          'When casting a Sign, consumes 3 Adrenaline points to cast the Sign at its highest level. Increases Sign intensity by 50%.\nAdrenaline Point gain: +1%',
          'When casting a Sign, consumes 3 Adrenaline points to cast the Sign at its highest level. Increases Sign intensity by 100%.\nAdrenaline Point gain: +2%',
          'When casting a Sign, consumes 3 Adrenaline points to cast the Sign at its highest level. Increases Sign intensity by 150%.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Crippling Strike',
        ranks: [
          'Critical hits from Fast Attacks cripple enemies, increasing their damage taken by 10%.\nAdrenaline Point gain: +1%',
          'Critical hits from Fast Attacks cripple enemies, increasing their damage taken by 20%.\nAdrenaline Point gain: +2%',
          'Critical hits from Fast Attacks cripple enemies, increasing their damage taken by 30%.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Arrow Deflection',
        ranks: [
          'You can parry ranged arrow attacks. A perfectly timed parry deflects arrows back at the enemy, causing damage. It has a 15% chance to instantly kill the target.\nAdrenaline Point gain: +1%',
          'You can parry ranged arrow attacks. A perfectly timed parry deflects arrows back at the enemy, causing 50% more damage. It has a 30% chance to instantly kill the target.\nAdrenaline Point gain: +2%',
          'You can parry ranged arrow attacks. A perfectly timed parry deflects arrows back at the enemy, causing 100% more damage. It has a 45% chance to instantly kill the target.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Cold Blood',
        ranks: [
          'Every bolt that reaches its target generates 0.3 Adrenaline point(s).\nAdrenaline Point gain: +1%',
          'Every bolt that reaches its target generates 0.6 Adrenaline point(s).\nAdrenaline Point gain: +2%',
          'Every bolt that reaches its target generates 1 Adrenaline point(s).\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Resolve',
        ranks: [
          'Reduces Adrenaline point loss by 33% when taking damage.\nAdrenaline Point gain: +1%',
          'Reduces Adrenaline point loss by 67% when taking damage.\nAdrenaline Point gain: +2%',
          'Reduces Adrenaline point loss by 100% when taking damage.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Anatomical Knowledge',
        ranks: [
          'Increases crossbow damage by 10% of current silver sword damage.\nAdrenaline Point gain: +1%',
          'Increases crossbow damage by 20% of current silver sword damage.\nAdrenaline Point gain: +2%',
          'Increases crossbow damage by 30% of current silver sword damage.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Lightning Reflexes',
        ranks: [
          'Time slows by an additional 30% while aiming with the crossbow. Increases headshot damage by 250%. Grants a 5% chance to instantly kill the target.\nAdrenaline Point gain: +1%',
          'Time slows by an additional 60% while aiming with the crossbow. Increases headshot damage by 250%. Grants a 10% chance to instantly kill the target.\nAdrenaline Point gain: +2%',
          'Time slows by an additional 90% while aiming with the crossbow. Increases headshot damage by 250%. Grants a 15% chance to instantly kill the target.\nAdrenaline Point gain: +3%',
        ],
      },
      {
        name: 'Maiming Shot',
        ranks: [
          'After a critical hit from a weapon or Sign, the next crossbow shot disable monster special abilities for 4 seconds.\nAdrenaline Point gain: +1%',
          'After a critical hit from a weapon or Sign, the next crossbow shot disable monster special abilities for 8 seconds.\nAdrenaline Point gain: +2%',
          'After a critical hit from a weapon or Sign, the next crossbow shot disable monster special abilities for 12 seconds.\nAdrenaline Point gain: +3%',
        ],
      },
    ],
  },
  {
    tree: 'Signs',
    skills: [
      {
        name: 'Far-reaching Aard',
        ranks: [
          "Increases Aard's range by 1 yard.\nStamina regeneration in combat: +0.5/s",
          "Increases Aard's range by 2 yards.\nStamina regeneration in combat: +1/s",
          "Increases Aard's range by 3 yards.\nStamina regeneration in combat: +1.5/s",
        ],
      },
      {
        name: 'Melt Armor',
        ranks: [
          'Damage dealt by Igni also reduces Armor. Reduction amount increases with skill level. Increases Burn chance by 10%.\nStamina regeneration in combat: +0.5/s',
          'Damage dealt by Igni also reduces Armor. Reduction amount increases with skill level. Increases Burn chance by 20%.\nStamina regeneration in combat: +1/s',
          'Damage dealt by Igni also reduces Armor. Reduction amount increases with skill level. Increases Burn chance by 30%.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Sustained Glyphs',
        ranks: [
          'Increases Sign duration by 5 seconds and area of effect by 10%. Increases the number of alternate mode charges by 2 and number of standard mode traps by 1.\nStamina regeneration in combat: +0.5/s',
          'Increases Sign duration by 10 seconds and area of effect by 20%. Increases the number of alternate mode charges by 4 and number of standard mode traps by 2.\nStamina regeneration in combat: +1/s',
          'Increases Sign duration by 15 seconds and area of effect by 30%. Increases the number of alternate mode charges by 6 and number of standard mode traps by 3.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Exploding Shield',
        ranks: [
          'Whenever Quen shield breaks, it pushes enemies back. Push-back strength increases with skill level.\nStamina regeneration in combat: +0.5/s',
          'Whenever Quen shield breaks, it pushes enemies back. Push-back strength increases with skill level.\nStamina regeneration in combat: +1/s',
          'Whenever Quen shield breaks, it pushes enemies back. Push-back strength increases with skill level.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Delusion',
        ranks: [
          'Target does not move towards Geralt while Axii is being cast. Increases the effectiveness of Axii in conversations.\nStamina regeneration in combat: +0.5/s',
          'Target does not move towards Geralt while Axii is being cast. Increases the effectiveness of Axii in conversations.\nStamina regeneration in combat: +1/s',
          'Target does not move towards Geralt while Axii is being cast. Increases the effectiveness of Axii in conversations.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Aard Sweep',
        ranks: [
          'Alternate Sign mode: Aard strikes down all opponents within a certain radius. Reduces knock-down chance by 21%.\nStamina regeneration in combat: +0.5/s',
          'Alternate Sign mode: Aard strikes down all opponents within a certain radius. Reduces knock-down chance by 17%.\nStamina regeneration in combat: +1/s',
          'Alternate Sign mode: Aard strikes down all opponents within a certain radius.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Fire Stream',
        ranks: [
          'Emits a continuous stream of fire that damages enemies.\nStamina regeneration in combat: +0.5/s',
          'Emits a continuous stream of fire that damages enemies. Stamina cost reduced by 25%.\nStamina regeneration in combat: +1/s',
          'Emits a continuous stream of fire that damages enemies. Stamina cost reduced by 50%.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Magic Trap',
        ranks: [
          'Releases a magic discharge that damages and slows enemies within a 14-yard radius.\nStamina regeneration in combat: +0.5/s',
          'Releases a magic discharge that damages and slows enemies within a 14-yard radius. Damage increased by 25%.\nStamina regeneration in combat: +1/s',
          'Releases a magic discharge that damages and slows enemies within a 14-yard radius. Damage increased by 50%.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Active Shield',
        ranks: [
          'Creates an active shield. Maintaining and blocking with it drains Stamina by 100%. Damage absorbed by the shield restores Vitality.\nStamina regeneration in combat: +0.5/s',
          'Creates an active shield. Maintaining and blocking with it drains Stamina by 50%. Damage absorbed by the shield restores Vitality.\nStamina regeneration in combat: +1/s',
          'Creates an active shield. Maintaining and blocking with it does not drain Stamina. Damage absorbed by the shield restores Vitality.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Puppet Master',
        ranks: [
          'A targeted enemy briefly becomes an ally that deals 20% more damage.\nStamina regeneration in combat: +0.5/s',
          'A targeted enemy briefly becomes an ally that deals 40% more damage.\nStamina regeneration in combat: +1/s',
          'A targeted enemy briefly becomes an ally that deals 60% more damage.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Supercharged Glyphs',
        ranks: [
          'Enemies under the influence of Yrden lose 10 Vitality or Essence per second. Damage sccales with enemy level and Sign intensity.\nStamina regeneration in combat: +0.5/s',
          'Enemies under the influence of Yrden lose 20 Vitality or Essence per second. Damage sccales with enemy level and Sign intensity.\nStamina regeneration in combat: +1/s',
          'Enemies under the influence of Yrden lose 30 Vitality or Essence per second. Damage sccales with enemy level and Sign intensity.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Shockwave',
        ranks: [
          'Increases damage dealt by Aard by 1% of current Vitality.\nStamina regeneration in combat: +0.5/s',
          'Increases damage dealt by Aard by 2% of current Vitality.\nStamina regeneration in combat: +1/s',
          'Increases damage dealt by Aard by 3% of current Vitality.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Domination',
        ranks: [
          'Axii can influence two targets simultaneously, but the effect is 50% weaker.\nStamina regeneration in combat: +0.5/s',
          'Axii can influence two targets simultaneously, but the effect is 25% weaker.\nStamina regeneration in combat: +1/s',
          'Axii can influence two targets simultaneously.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Catalyst',
        ranks: [
          'Increases Aard and Igni intensity by 30% against enemies inside Yrden.\nStamina regeneration in combat: +0.5/s',
          'Increases Aard and Igni intensity by 60% against enemies inside Yrden.\nStamina regeneration in combat: +1/s',
          'Increases Aard and Igni intensity by 90% against enemies inside Yrden.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Fortify Signs',
        ranks: [
          'Increases the duration of Yrden, Quen, and Axii by 20%.\nStamina regeneration in combat: +0.5/s',
          'Increases the duration of Yrden, Quen, and Axii by 40%.\nStamina regeneration in combat: +1/s',
          'Increases the duration of Yrden, Quen, and Axii by 60%.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Chain Reaction',
        ranks: [
          'Casting a Sign increases the intensity of the next different Sign by 5%. Stacks up to 5 times.\nStamina regeneration in combat: +0.5/s',
          'Casting a Sign increases the intensity of the next different Sign by 10%. Stacks up to 5 times.\nStamina regeneration in combat: +1/s',
          'Casting a Sign increases the intensity of the next different Sign by 15%. Stacks up to 5 times.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Focus',
        ranks: [
          'Adrenaline increases Sign intensity by 10% per Adrenaline Point.\nStamina regeneration in combat: +0.5/s',
          'Adrenaline increases Sign intensity by 20% per Adrenaline Point.\nStamina regeneration in combat: +1/s',
          'Adrenaline increases Sign intensity by 30% per Adrenaline Point.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Sidestep',
        ranks: [
          'After a successful dodge or roll, reduces the Stamina cost for the next Sign cast by 20%.\nStamina regeneration in combat: +0.5/s',
          'After a successful dodge or roll, reduces the Stamina cost for the next Sign cast by 40%.\nStamina regeneration in combat: +1/s',
          'After a successful dodge or roll, reduces the Stamina cost for the next Sign cast by 60%.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Aftershock',
        ranks: [
          'Casting any Sign deals magic damage within a small radius. Damage increase with skill level and Sign intensity.\nStamina regeneration in combat: +0.5/s',
          'Casting any Sign deals magic damage within a small radius. Damage increase with skill level and Sign intensity.\nStamina regeneration in combat: +1/s',
          'Casting any Sign deals magic damage within a small radius. Damage increase with skill level and Sign intensity.\nStamina regeneration in combat: +1.5/s',
        ],
      },
      {
        name: 'Resonance',
        ranks: [
          'After casting a Sign, the next three melee attacks deal additional damage equal to 10% sign intensity.\nStamina regeneration in combat: +0.5/s',
          'After casting a Sign, the next three melee attacks deal additional damage equal to 20% sign intensity.\nStamina regeneration in combat: +1/s',
          'After casting a Sign, the next three melee attacks deal additional damage equal to 30% sign intensity.\nStamina regeneration in combat: +1.5/s',
        ],
      },
    ],
  },
  {
    tree: 'Alchemy',
    skills: [
      {
        name: 'Refreshment',
        ranks: [
          'Each Potion dose heals 10% Vitality.\nPotion duration time and bomb damage: +2%',
          'Each Potion dose heals 20% Vitality.\nPotion duration time and bomb damage: +4%',
          'Each Potion dose heals 30% Vitality.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Efficiency',
        ranks: [
          'Increases the maximum number of bombs in each slot by 1.\nPotion duration time and bomb damage: +2%',
          'Increases the maximum number of bombs in each slot by 2.\nPotion duration time and bomb damage: +4%',
          'Increases the maximum number of bombs in each slot by 3.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Frenzy',
        ranks: [
          'If potion Toxicity is greater than 1, time automatically slows by 5% when the enemy is about to perform a counterattack.\nPotion duration time and bomb damage: +2%',
          'If potion Toxicity is greater than 1, time automatically slows by 10% when the enemy is about to perform a counterattack.\nPotion duration time and bomb damage: +4%',
          'If potion Toxicity is greater than 1, time automatically slows by 15% when the enemy is about to perform a counterattack.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Adaptability',
        ranks: [
          'Extends the duration of all mutagen decoctions by 33%.\nPotion duration time and bomb damage: +2%',
          'Extends the duration of all mutagen decoctions by 67%.\nPotion duration time and bomb damage: +4%',
          'Extends the duration of all mutagen decoctions by 100%.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Endure Pain',
        ranks: [
          'Increases maximum Vitality by 10% if Toxicity exceeds the safety threshold.\nPotion duration time and bomb damage: +2%',
          'Increases maximum Vitality by 20% if Toxicity exceeds the safety threshold.\nPotion duration time and bomb damage: +4%',
          'Increases maximum Vitality by 30% if Toxicity exceeds the safety threshold.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Pyrotechnics',
        ranks: [
          'All bombs, even those that do not inflict damage, now deal 50 damage in addition to their normal effects.\nPotion duration time and bomb damage: +2%',
          'All bombs, even those that do not inflict damage, now deal 100 damage in addition to their normal effects.\nPotion duration time and bomb damage: +4%',
          'All bombs, even those that do not inflict damage, now deal 150 damage in addition to their normal effects.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Hunter Instinct',
        ranks: [
          'When Adrenaline points reach their maximum, increases critical hit damage against the targeted enemy type by 20%, if the correct oil is applied.\nPotion duration time and bomb damage: +2%',
          'When Adrenaline points reach their maximum, increases critical hit damage against the targeted enemy type by 40%, if the correct oil is applied.\nPotion duration time and bomb damage: +4%',
          'When Adrenaline points reach their maximum, increases critical hit damage against the targeted enemy type by 60%, if the correct oil is applied.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Poison Blades',
        ranks: [
          'Oil applied to blades has a 5% chance of poisoning the target.\nPotion duration time and bomb damage: +2%',
          'Oil applied to blades has a 10% chance of poisoning the target.\nPotion duration time and bomb damage: +4%',
          'Oil applied to blades has a 15% chance of poisoning the target.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Protective Coating',
        ranks: [
          'Adds 5% protection against attacks from the monster type targeted by the oil.\nPotion duration time and bomb damage: +2%',
          'Adds 10% protection against attacks from the monster type targeted by the oil.\nPotion duration time and bomb damage: +4%',
          'Adds 15% protection against attacks from the monster type targeted by the oil.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Acquired Tolerance',
        ranks: [
          'Every learned alchemical recipe increases maximum Toxicity by 1.\nPotion duration time and bomb damage: +2%',
          'Every learned alchemical recipe increases maximum Toxicity by 2.\nPotion duration time and bomb damage: +4%',
          'Every learned alchemical recipe increases maximum Toxicity by 3.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Toxic Shock',
        ranks: [
          'Hitting a poisoned enemy with a Strong Attack consumes the poison, causing an extra burst of poison damage equal to 25% of the attack damage. Can be used once every 5 seconds.\nPotion duration time and bomb damage: +2%',
          'Hitting a poisoned enemy with a Strong Attack consumes the poison, causing an extra burst of poison damage equal to 50% of the attack damage. Can be used once every 5 seconds.\nPotion duration time and bomb damage: +4%',
          'Hitting a poisoned enemy with a Strong Attack consumes the poison, causing an extra burst of poison damage equal to 75% of the attack damage. Can be used once every 5 seconds.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Tissue Transmutation',
        ranks: [
          "Decoctions increase maximum Vitality by 300 for the decoction's effective duration.\nPotion duration time and bomb damage: +2%",
          "Decoctions increase maximum Vitality by 600 for the decoction's effective duration.\nPotion duration time and bomb damage: +4%",
          "Decoctions increase maximum Vitality by 900 for the decoction's effective duration.\nPotion duration time and bomb damage: +6%",
        ],
      },
      {
        name: 'Delayed Recovery',
        ranks: [
          "When Toxicity is above 70%, each consumed potion increases the duration of active potions' effects by 5 seconds, up to their maximum duration.\nPotion duration time and bomb damage: +2%",
          "When Toxicity is above 65%, each consumed potion increases the duration of active potions' effects by 5 seconds, up to their maximum duration.\nPotion duration time and bomb damage: +4%",
          "When Toxicity is above 60%, each consumed potion increases the duration of active potions' effects by 5 seconds, up to their maximum duration.\nPotion duration time and bomb damage: +6%",
        ],
      },
      {
        name: 'High Tolerance',
        ranks: [
          'While at 80% Toxicity or higher, take 150% damage from enemies. Increase critical hit damage equal to 33% of current Toxicity.\nPotion duration time and bomb damage: +2%',
          'While at 80% Toxicity or higher, take 150% damage from enemies. Increase critical hit damage equal to 67% of current Toxicity.\nPotion duration time and bomb damage: +4%',
          'While at 80% Toxicity or higher, take 150% damage from enemies. Increase critical hit damage equal to 100% of current Toxicity.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Volatile Compound',
        ranks: [
          'Bomb damage increases by 0.1% per point of Toxicity.\nPotion duration time and bomb damage: +2%',
          'Bomb damage increases by 0.2% per point of Toxicity.\nPotion duration time and bomb damage: +4%',
          'Bomb damage increases by 0.3% per point of Toxicity.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Fast Metabolism',
        ranks: [
          'Toxicity drops 1 point per second faster.\nPotion duration time and bomb damage: +2%',
          'Toxicity drops 2 points per second faster.\nPotion duration time and bomb damage: +4%',
          'Toxicity drops 3 points per second faster.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Debilitating Poison',
        ranks: [
          'Poisoned targets deal 5% less damage.\nPotion duration time and bomb damage: +2%',
          'Poisoned targets deal 10% less damage.\nPotion duration time and bomb damage: +4%',
          'Poisoned targets deal 15% less damage.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Cluster Bombs',
        ranks: [
          "Bombs explode into 2 fragments, dealing 40% of the original bomb's damage for each fragment.\nPotion duration time and bomb damage: +2%",
          "Bombs explode into 3 fragments, dealing 40% of the original bomb's damage for each fragment.\nPotion duration time and bomb damage: +4%",
          "Bombs explode into 4 fragments, dealing 40% of the original bomb's damage for each fragment.\nPotion duration time and bomb damage: +6%",
        ],
      },
      {
        name: 'Side Effects',
        ranks: [
          'Drinking a potion has a 33% chance of activating the effects of another random potion without increasing Toxicity. You can only have one bonus effect at a time.\nPotion duration time and bomb damage: +2%',
          'Drinking a potion has a 67% chance of activating the effects of another random potion without increasing Toxicity. You can only have one bonus effect at a time.\nPotion duration time and bomb damage: +4%',
          'Drinking a potion has a 100% chance of activating the effects of another random potion without increasing Toxicity. You can only have one bonus effect at a time.\nPotion duration time and bomb damage: +6%',
        ],
      },
      {
        name: 'Potent Sting',
        ranks: [
          'Poisoned weapons deal an additional 5% damage, or an additional 10% damage to targets immune to poison.\nPotion duration time and bomb damage: +2%',
          'Poisoned weapons deal an additional 10% damage, or an additional 20% damage to targets immune to poison.\nPotion duration time and bomb damage: +4%',
          'Poisoned weapons deal an additional 15% damage, or an additional 30% damage to targets immune to poison.\nPotion duration time and bomb damage: +6%',
        ],
      },
    ],
  },
  {
    tree: 'General',
    skills: [
      {
        name: 'Cat School Techniques',
        ranks: [
          'Each piece of Light Armor increases critical hit damage by 8% and fast attack damage by 2%.\nVitality Gain: +1%',
          'Each piece of Light Armor increases critical hit damage by 16% and fast attack damage by 4%.\nVitality Gain: +2%',
          'Each piece of Light Armor increases critical hit damage by 24% and fast attack damage by 6%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Battle Frenzy',
        ranks: [
          'Increases critical hit chance by 3% per Adrenaline point available.\nVitality Gain: +1%',
          'Increases critical hit chance by 6% per Adrenaline point available.\nVitality Gain: +2%',
          'Increases critical hit chance by 9% per Adrenaline point available.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Adrenaline Burst',
        ranks: [
          'Increases Adrenaline generation by 2% and allows Signs to generate Adrenaline.\nVitality Gain: +1%',
          'Increases Adrenaline generation by 4% and allows Signs to generate Adrenaline.\nVitality Gain: +2%',
          'Increases Adrenaline generation by 6% and allows Signs to generate Adrenaline.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Attack Is the Best Defense',
        ranks: [
          'Each successful defensive action generates Adrenaline points. Scales with every Skill level.\nVitality Gain: +1%',
          'Each successful defensive action generates Adrenaline points. Scales with every Skill level.\nVitality Gain: +2%',
          'Each successful defensive action generates Adrenaline points. Scales with every Skill level.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Sun and Stars',
        ranks: [
          'During the day, Vitality regenerates by an additional 10 points per second when Geralt is not in combat. During the night, Stamina regenerates by an additional 1 point per second during combat.\nVitality Gain: +1%',
          'During the day, Vitality regenerates by an additional 20 points per second when Geralt is not in combat. During the night, Stamina regenerates by an additional 2 points per second during combat.\nVitality Gain: +2%',
          'During the day, Vitality regenerates by an additional 30 points per second when Geralt is not in combat. During the night, Stamina regenerates by an additional 3 points per second during combat.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Strong Back',
        ranks: [
          'Increases maximum inventory weight by 20.\nVitality Gain: +1%',
          'Increases maximum inventory weight by 40.\nVitality Gain: +2%',
          'Increases maximum inventory weight by 60.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Survival Instinct',
        ranks: [
          'Increases maximum Vitality by 8%.\nVitality Gain: +1%',
          'Increases maximum Vitality by 16%.\nVitality Gain: +2%',
          'Increases maximum Vitality by 24%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Gourmand',
        ranks: [
          'Consuming food regenerates Vitality for 5 minutes.\nVitality Gain: +1%',
          'Consuming food regenerates Vitality for 10 minutes.\nVitality Gain: +2%',
          'Consuming food regenerates Vitality for 15 minutes.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Anger Management',
        ranks: [
          'Allow casting Signs using Adrenaline points when Stamina is empty. Consumes 2 Adrenaline Points per cast.\nVitality Gain: +1%',
          'Allow casting Signs using Adrenaline points when Stamina is empty. Consumes 1.5 Adrenaline Points per cast.\nVitality Gain: +2%',
          'Allow casting Signs using Adrenaline points when Stamina is empty. Consumes 1 Adrenaline Points per cast.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Elemental Attunement',
        ranks: [
          'Increases non-physical damage (fire, frost, force, magic, poison) by 3%.\nVitality Gain: +1%',
          'Increases non-physical damage (fire, frost, force, magic, poison) by 6%.\nVitality Gain: +2%',
          'Increases non-physical damage (fire, frost, force, magic, poison) by 9%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Synergy',
        ranks: [
          'Increases bonuses for mutagens placed in mutagen slots by 10%.\nVitality Gain: +1%',
          'Increases bonuses for mutagens placed in mutagen slots by 20%.\nVitality Gain: +2%',
          'Increases bonuses for mutagens placed in mutagen slots by 30%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Element of Surprise',
        ranks: [
          'Hitting Enemies with a bomb increases your melee damage by 10% for 10 seconds.\nVitality Gain: +1%',
          'Hitting Enemies with a bomb increases your melee damage by 20% for 10 seconds.\nVitality Gain: +2%',
          'Hitting Enemies with a bomb increases your melee damage by 30% for 10 seconds.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Metabolic Control',
        ranks: [
          'Increases maximum Toxicity by 10.\nVitality Gain: +1%',
          'Increases maximum Toxicity by 20.\nVitality Gain: +2%',
          'Increases maximum Toxicity by 30.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Advanced Pyrotechnics',
        ranks: [
          'When thrown, bombs have a 10% chance of not being consumed. Grants immunity to damage dealt by the thrown bomb.\nVitality Gain: +1%',
          'When thrown, bombs have a 20% chance of not being consumed. Grants immunity to damage dealt by the thrown bomb.\nVitality Gain: +2%',
          'When thrown, bombs have a 30% chance of not being consumed. Grants immunity to damage dealt by the thrown bomb.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Metabolic Boost',
        ranks: [
          'Consumes Adrenaline and reduces the Toxicity cost of potions by 10% per Adrenaline point. Does not affect mutagen decoctions.\nVitality Gain: +1%',
          'Consumes Adrenaline and reduces the Toxicity cost of potions by 20% per Adrenaline point. Does not affect mutagen decoctions.\nVitality Gain: +2%',
          'Consumes Adrenaline and reduces the Toxicity cost of potions by 30% per Adrenaline point. Does not affect mutagen decoctions.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Wolf School Techniques',
        ranks: [
          'Each piece of Medium Armor increases weapon damage by 2% and Sign intensity by 2%.\nVitality Gain: +1%',
          'Each piece of Medium Armor increases weapon damage by 4% and Sign intensity by 4%.\nVitality Gain: +2%',
          'Each piece of Medium Armor increases weapon damage by 6% and Sign intensity by 6%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Bear School Techniques',
        ranks: [
          'Each piece of Heavy Armor increases maximum Vitality by 2% and Strong Attack damage by 2%.\nVitality Gain: +1%',
          'Each piece of Heavy Armor increases maximum Vitality by 4% and Strong Attack damage by 4%.\nVitality Gain: +2%',
          'Each piece of Heavy Armor increases maximum Vitality by 6% and Strong Attack damage by 6%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Griffin School Techniques',
        ranks: [
          'Each piece of Medium Armor increases Sign intensity by 2% and Stamina regeneration by 0/s.\nVitality Gain: +1%',
          'Each piece of Medium Armor increases Sign intensity by 4% and Stamina regeneration by 0/s.\nVitality Gain: +2%',
          'Each piece of Medium Armor increases Sign intensity by 6% and Stamina regeneration by 1/s.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Manticore School Techniques',
        ranks: [
          'Each piece of Medium Armor increases sword damage by 2% and bomb damage by 2%.\nVitality Gain: +1%',
          'Each piece of Medium Armor increases sword damage by 4% and bomb damage by 4%.\nVitality Gain: +2%',
          'Each piece of Medium Armor increases sword damage by 6% and bomb damage by 6%.\nVitality Gain: +3%',
        ],
      },
      {
        name: 'Viper School Techniques',
        ranks: [
          'Each piece of Medium Armor increases maximum Vitality by 2% and poison damage by 2%.\nVitality Gain: +1%',
          'Each piece of Medium Armor increases maximum Vitality by 4% and poison damage by 4%.\nVitality Gain: +2%',
          'Each piece of Medium Armor increases maximum Vitality by 6% and poison damage by 6%.\nVitality Gain: +3%',
        ],
      },
    ],
  },
];
