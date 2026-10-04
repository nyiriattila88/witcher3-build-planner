import { DECOCTIONS, POTIONS } from '../data/alchemy';
import { GEAR, SET_BONUSES } from '../data/gear';
import { EXTRA_SLOT_UNLOCKS, MUTAGENS, MUTATIONS } from '../data/mutations';
import { KEY_SKILLS, SKILL_TREES } from '../data/skills';
import { TREE_LAYOUT } from '../data/tree-layout';
import { ENCHANTMENTS, UPGRADES } from '../data/upgrades';
import { createCatalog, type Catalog } from './catalog';

// The catalog of the shipped game data. Tests that need other data call createCatalog directly.
export const createGameCatalog = (): Catalog =>
  createCatalog({
    skillTrees: SKILL_TREES,
    keySkills: KEY_SKILLS,
    treeLayout: TREE_LAYOUT,
    mutagens: MUTAGENS,
    mutations: MUTATIONS,
    extraSlotUnlocks: EXTRA_SLOT_UNLOCKS,
    potions: POTIONS,
    decoctions: DECOCTIONS,
    gear: GEAR,
    setBonuses: SET_BONUSES,
    upgrades: UPGRADES,
    enchantments: ENCHANTMENTS,
  });
