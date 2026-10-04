import type { Catalog } from '../catalog/catalog';
import type { TreeName } from '../data/skills';
import { treeColour } from './colours';

export type PlannerTab =
  | { readonly kind: 'tree'; readonly tree: TreeName }
  | { readonly kind: 'mutagens' }
  | { readonly kind: 'mutations' }
  | { readonly kind: 'toxicity' }
  | { readonly kind: 'gear' };

export const plannerTabs = (catalog: Catalog): readonly PlannerTab[] => [
  ...catalog.trees.map((tree): PlannerTab => ({ kind: 'tree', tree: tree.name })),
  { kind: 'mutagens' },
  { kind: 'mutations' },
  { kind: 'toxicity' },
  { kind: 'gear' },
];

export const tabKey = (tab: PlannerTab): string => (tab.kind === 'tree' ? tab.tree : tab.kind);

export const tabColour = (tab: PlannerTab): string =>
  tab.kind === 'tree' ? treeColour(tab.tree) : `var(--tab-${tab.kind})`;

export const tabName = (tab: PlannerTab): string => {
  switch (tab.kind) {
    case 'tree':
      return tab.tree;
    case 'mutagens':
      return 'Mutagens';
    case 'mutations':
      return 'Mutations';
    case 'toxicity':
      return 'Toxicity';
    case 'gear':
      return 'Gear';
  }
};

export const tabTip = (tab: PlannerTab): string => {
  switch (tab.kind) {
    case 'tree':
      return 'Geralt can only have a certain number of active skills regardless of the number of points assigned. To make a skill active, drag it to a skill slot. Tip: pair skill slots with mutagens of the same colour for increased bonuses.';
    case 'mutagens':
      return 'Witchers can assign mutagens to their skill slots. Each mutagen provides a passive bonus, increased by every skill of the matching colour in the same slot group. Drag a mutagen (diamond) to a mutagen slot.';
    case 'mutations':
      return "To slot a mutation, it must first be researched. Research costs skill points and requires every linked mutation below it. Strengthened Synapses is always researched. The four extra slots around the mutation open at 2, 4, 8 and all 12 researched mutations, and they only take skills of the slotted mutation's colours.";
    case 'toxicity':
      return 'Plan which potions and decoctions are active at the same time. Since patch 4.0 an overdose starts above half of the maximum Toxicity. Acquired Tolerance and Metabolic Control raise the maximum only while they sit in a slot, and so does every piece of Manticore armor you wear.';
    case 'gear':
      return 'Pick the witcher school gear you wear, one item per slot, mixing the schools freely. Swords take runes and armor takes glyphs, one per socket. A sword or chest armor with 3 sockets can take a runeword or glyphword from the Runewright instead, which fills them all. Wearing 3 or 6 pieces of one school brings its set bonuses.';
  }
};
