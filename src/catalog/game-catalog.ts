import { DECOCTIONS, POTIONS } from '../data/alchemy';
import { EXTRA_SLOT_UNLOCKS, MUTAGENS, MUTATIONS } from '../data/mutations';
import { SKILL_TREES } from '../data/skills';
import { TREE_LAYOUT } from '../data/tree-layout';
import { createCatalog, type Catalog } from './catalog';

// The catalog of the shipped game data. Tests that need other data call createCatalog directly.
export const createGameCatalog = (): Catalog =>
  createCatalog({
    skillTrees: SKILL_TREES,
    treeLayout: TREE_LAYOUT,
    mutagens: MUTAGENS,
    mutations: MUTATIONS,
    extraSlotUnlocks: EXTRA_SLOT_UNLOCKS,
    potions: POTIONS,
    decoctions: DECOCTIONS,
  });
