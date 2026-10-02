import type { Catalog } from '../catalog/catalog';
import type { TreeName } from '../data/skills';

export type PlannerTab =
  | { readonly kind: 'tree'; readonly tree: TreeName }
  | { readonly kind: 'mutagens' }
  | { readonly kind: 'mutations' };

export const plannerTabs = (catalog: Catalog): readonly PlannerTab[] => [
  ...catalog.trees.map((tree): PlannerTab => ({ kind: 'tree', tree: tree.name })),
  { kind: 'mutagens' },
  { kind: 'mutations' },
];

export const tabKey = (tab: PlannerTab): string => (tab.kind === 'tree' ? tab.tree : tab.kind);

export const tabName = (tab: PlannerTab): string => {
  switch (tab.kind) {
    case 'tree':
      return tab.tree;
    case 'mutagens':
      return 'Mutagens';
    case 'mutations':
      return 'Mutations';
  }
};

export const tabTip = (tab: PlannerTab): string => {
  switch (tab.kind) {
    case 'tree':
      return 'Geralt can only have a certain number of active skills regardless of the number of points assigned. To make a skill active, drag it to a skill slot. Tip: pair skill slots with mutagens of the same colour for increased bonuses.';
    case 'mutagens':
      return 'Witchers can assign mutagens to their skill slots. Each mutagen provides a passive bonus, increased by every skill of the matching colour in the same slot group. Drag a mutagen (diamond) to a mutagen slot.';
    case 'mutations':
      return "To slot a mutation, it must first be researched. Research costs skill points and requires every linked mutation below it. Strengthened Synapses is always researched: it unlocks slots 13–16 at 2, 4, 8 and 12 researched mutations, and those slots only take skills matching the slotted mutation's colours.";
  }
};
