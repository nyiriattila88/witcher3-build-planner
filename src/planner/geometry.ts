// Tree pane geometry in CSS pixels. Node positions are screenshot pixels, scaled around the top-left node.
const TREE_SCALE = 1.45;
const SCREENSHOT_ORIGIN = [80, 62] as const;
// The cleaned screenshot backdrops in public/images/backgrounds are all this wide.
const SCREENSHOT_WIDTH = 604;
export const NODE_WIDTH = 108;
const NODE_HEIGHT = 94;
export const ICON_SIZE = 66;
const TREE_PADDING = 10;
export const PANE_WIDTH = 760;

export type Point = readonly [number, number];

// The label hangs below the icon, so a node is placed by its icon centre.
export const nodeCentre = ([x, y]: Point): Point => [
  TREE_PADDING + NODE_WIDTH / 2 + (x - SCREENSHOT_ORIGIN[0]) * TREE_SCALE,
  TREE_PADDING + ICON_SIZE / 2 + (y - SCREENSHOT_ORIGIN[1]) * TREE_SCALE,
];

export const treePaneSize = (positions: readonly Point[]): { width: number; height: number } => {
  const centres = positions.map(nodeCentre);
  return {
    width: Math.max(...centres.map(([x]) => x)) + NODE_WIDTH / 2 + TREE_PADDING,
    height: Math.max(...centres.map(([, y]) => y)) - ICON_SIZE / 2 + NODE_HEIGHT + TREE_PADDING,
  };
};

// The in-game backdrop is scaled and shifted exactly like the node positions.
export const treeBackdrop = {
  size: `${SCREENSHOT_WIDTH * TREE_SCALE}px auto`,
  position: `${TREE_PADDING + NODE_WIDTH / 2 - SCREENSHOT_ORIGIN[0] * TREE_SCALE}px ${
    TREE_PADDING + ICON_SIZE / 2 - SCREENSHOT_ORIGIN[1] * TREE_SCALE
  }px`,
};

export const MUTATION_GRID = { left: 110, top: 70, column: 135, row: 125, radius: 38, height: 520 };

export const mutationCentre = ([column, row]: Point): Point => [
  MUTATION_GRID.left + column * MUTATION_GRID.column,
  MUTATION_GRID.top + row * MUTATION_GRID.row,
];

// Slot board geometry, laid out like the in-game character screen.
export const BOARD_SIZE = { width: 640, height: 610 };
export const SLOT_SIZE = 78;
const SLOT_POSITIONS: readonly Point[] = [
  [150, 20],
  [150, 105],
  [150, 190],
  [412, 20],
  [412, 105],
  [412, 190],
  [150, 340],
  [150, 425],
  [150, 510],
  [412, 340],
  [412, 425],
  [412, 510],
  [281, 105],
  [281, 20],
  [281, 425],
  [281, 510],
];
export const MUTAGEN_SLOT_SIZE = 76;
export const MUTAGEN_SLOT_CENTRES: readonly Point[] = [
  [75, 145],
  [565, 145],
  [75, 465],
  [565, 465],
];
export const MUTATION_SLOT_POSITION: Point = [268, 252];

export const slotPosition = (index: number): Point => SLOT_POSITIONS[index] ?? [0, 0];
