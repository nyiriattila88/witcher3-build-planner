// Mutagens, mutations and the extra slot rules of the original game, after the rpg-gaming.com TW3 build planner.
// Build codes address mutagens and mutations by their position in these lists: append new entries, never reorder.
const MUTAGENS = {
  "lesser-red": { name: "Lesser Red Mutagen", tree: "Combat", bonus: 5, effect: "Attack Power", unit: "%" },
  "red": { name: "Red Mutagen", tree: "Combat", bonus: 7, effect: "Attack Power", unit: "%" },
  "greater-red": { name: "Greater Red Mutagen", tree: "Combat", bonus: 10, effect: "Attack Power", unit: "%" },
  "lesser-blue": { name: "Lesser Blue Mutagen", tree: "Signs", bonus: 5, effect: "Sign Intensity", unit: "%" },
  "blue": { name: "Blue Mutagen", tree: "Signs", bonus: 7, effect: "Sign Intensity", unit: "%" },
  "greater-blue": { name: "Greater Blue Mutagen", tree: "Signs", bonus: 10, effect: "Sign Intensity", unit: "%" },
  "lesser-green": { name: "Lesser Green Mutagen", tree: "Alchemy", bonus: 50, effect: "Vitality", unit: "" },
  "green": { name: "Green Mutagen", tree: "Alchemy", bonus: 100, effect: "Vitality", unit: "" },
  "greater-green": { name: "Greater Green Mutagen", tree: "Alchemy", bonus: 150, effect: "Vitality", unit: "" }
};

// grid is the [column, row] cell in the mutation tree, requires lists the mutations to research first.
// An innate mutation is always researched and cannot be slotted.
const MUTATIONS = {
  "strengthened-synapses": {
    name: "Strengthened Synapses",
    trees: ["Combat", "Signs", "Alchemy"],
    cost: 0,
    requires: [],
    grid: [2, 3],
    innate: true,
    description: "Unlocks additional ability slots as you research more mutations. Additional slots are unlocked at 2, 4, 8 & 12 researched mutations respectively. Additional skill slots can only be filled with skills that have a color matching the slotted mutation."
  },
  "magic-sensibilities": {
    name: "Magic Sensibilities",
    trees: ["Signs"],
    cost: 2,
    requires: ["strengthened-synapses"],
    grid: [1, 2],
    description: "Signs can deal critical hits. Sign crit chance and damage scale with intensity. Enemies killed by sign crits explode."
  },
  "deadly-counter": {
    name: "Deadly Counter",
    trees: ["Combat"],
    cost: 2,
    requires: ["strengthened-synapses"],
    grid: [2, 2],
    description: "Swords do +25% damage to enemies immune to counterattacks. If enemy is at less than 25% health, a counterattack triggers a finisher."
  },
  "toxic-blood": {
    name: "Toxic Blood",
    trees: ["Alchemy"],
    cost: 2,
    requires: ["strengthened-synapses"],
    grid: [3, 2],
    description: "When you're injured, the attacker receives 1.5% of that amount of damage for every point of your Toxicity level."
  },
  "piercing-cold": {
    name: "Piercing Cold",
    trees: ["Signs"],
    cost: 3,
    requires: ["magic-sensibilities"],
    grid: [0, 2],
    description: "Aard freezes enemies. Enemies that are frozen and knocked down at the same time die."
  },
  "conductors-of-magic": {
    name: "Conductors of Magic",
    trees: ["Combat", "Signs"],
    cost: 5,
    requires: ["piercing-cold"],
    grid: [0, 3],
    description: "Sign damage increases if you have a magic, unique or witcher sword drawn."
  },
  "adrenaline-rush": {
    name: "Adrenaline Rush",
    trees: ["Combat", "Signs"],
    cost: 5,
    requires: ["piercing-cold", "bloodbath"],
    grid: [1, 1],
    description: "Increases attack power and sign intensity by 30% for every enemy you face (for 30 seconds). After the buff expires, decreases them by 10% for every enemy, for another 30 seconds."
  },
  "bloodbath": {
    name: "Bloodbath",
    trees: ["Combat"],
    cost: 2,
    requires: ["deadly-counter"],
    grid: [2, 0],
    description: "Each weapon blow gives +5% attack power until end of combat. Bonus is lost if you take damage."
  },
  "euphoria": {
    name: "Euphoria",
    trees: ["Alchemy"],
    cost: 3,
    requires: ["toxic-blood"],
    grid: [4, 2],
    description: "Each point of toxicity increases sword damage and sign intensity by 0.75%."
  },
  "mutated-skin": {
    name: "Mutated Skin",
    trees: ["Combat", "Alchemy"],
    cost: 5,
    requires: ["euphoria"],
    grid: [4, 3],
    description: "Each adrenaline point decreases damage received by 15%."
  },
  "cat-eyes": {
    name: "Cat Eyes",
    trees: ["Combat", "Alchemy"],
    cost: 5,
    requires: ["euphoria", "bloodbath"],
    grid: [3, 1],
    description: "Crossbow damage increases by 116, crit chance by 20%. Bolts pierce, knock down or stun. If enemies are at full health, they lose 30% from bolt shot."
  },
  "metamorphosis": {
    name: "Metamorphosis",
    trees: ["Combat", "Signs", "Alchemy"],
    cost: 7,
    requires: ["cat-eyes"],
    grid: [4, 0],
    description: "Applying critical effects to opponents activates a random decoction for 2 minutes with no toxicity (up to 3 at a time)."
  },
  "second-life": {
    name: "Second Life",
    trees: ["Combat", "Signs", "Alchemy"],
    cost: 7,
    requires: ["adrenaline-rush"],
    grid: [0, 0],
    description: "When you're at 0 health, you become invulnerable for a short time and regenerate all your health. Can be triggered once every 3 minutes."
  }
};

// Slots 13-16 open at this many researched mutations, Strengthened Synapses not counted.
const EXTRA_SLOT_UNLOCKS = [2, 4, 8, 12];
