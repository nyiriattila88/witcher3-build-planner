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

// The name hangs below the disc and may be as wide as a column.
export const MUTATION_GRID = {
  left: 110,
  top: 60,
  column: 135,
  row: 125,
  radius: 38,
  label: 128,
  height: 540,
};

export const mutationCentre = ([column, row]: Point): Point => [
  MUTATION_GRID.left + column * MUTATION_GRID.column,
  MUTATION_GRID.top + row * MUTATION_GRID.row,
];

// Slot board geometry, laid out like the in-game character screen: a group of three slots in each
// corner with its mutagen beside it, the extra slots 13-16 above and below the mutation in the middle.
export const BOARD_SIZE = { width: 700, height: 650 };
export const SLOT_SIZE = 60;
export const BOARD_CENTRE: Point = [350, 325];
// From the middle column to a group's column, from one slot row to the next.
const COLUMN = 92;
const ROW = 80;
// The bracket runs between a group's slots and its mutagen, this far from the slots.
const BRACKET_GAP = 14;
export const MUTAGEN_SLOT_SIZE = 72;
const MUTAGEN_OFFSET = 205;
export const MUTATION_SLOT_RADIUS = 56;

const [centreX, centreY] = BOARD_CENTRE;
// Slot rows of the upper and the lower groups, from the top.
const upperRows = [centreY - 3.5 * ROW, centreY - 2.5 * ROW, centreY - 1.5 * ROW];
const lowerRows = [centreY + 1.5 * ROW, centreY + 2.5 * ROW, centreY + 3.5 * ROW];
const groupRows = [upperRows, upperRows, lowerRows, lowerRows];

export const isRightGroup = (group: number): boolean => group % 2 === 1;

const groupColumn = (group: number): number => centreX + (isRightGroup(group) ? COLUMN : -COLUMN);

// Slot centres by index: the four groups of three, then slots 13 and 14 above the mutation and 15 and
// 16 below it, each pair counted outwards from the middle.
const SLOT_CENTRES: readonly Point[] = [
  ...[0, 1, 2, 3].flatMap((group) =>
    (groupRows[group] ?? []).map((y): Point => [groupColumn(group), y]),
  ),
  [centreX, centreY - 1.5 * ROW],
  [centreX, centreY - 2.5 * ROW],
  [centreX, centreY + 1.5 * ROW],
  [centreX, centreY + 2.5 * ROW],
];

export const slotCentre = (index: number): Point => SLOT_CENTRES[index] ?? BOARD_CENTRE;

// A group's mutagen sits level with its middle slot, its header level with the first.
export const mutagenSlotCentre = (group: number): Point => [
  centreX + (isRightGroup(group) ? MUTAGEN_OFFSET : -MUTAGEN_OFFSET),
  groupRows[group]?.[1] ?? centreY,
];

// The x of a group's bracket spine, between its slots and its mutagen.
export const bracketX = (group: number): number =>
  groupColumn(group) + (isRightGroup(group) ? 1 : -1) * (SLOT_SIZE / 2 + BRACKET_GAP);

const HEADER_HEIGHT = 36;
const BOARD_MARGIN = 16;

// The bar with the group's mutagen bonus, from the bracket out to the board's edge.
export const groupHeaderBox = (
  group: number,
): { left: number; top: number; width: number; height: number } => {
  const top = (groupRows[group]?.[0] ?? centreY) - HEADER_HEIGHT / 2;
  if (isRightGroup(group)) {
    const left = bracketX(group) + BRACKET_GAP;
    return { left, top, width: BOARD_SIZE.width - BOARD_MARGIN - left, height: HEADER_HEIGHT };
  }
  const right = bracketX(group) - BRACKET_GAP;
  return { left: BOARD_MARGIN, top, width: right - BOARD_MARGIN, height: HEADER_HEIGHT };
};

const TOOLTIP_GAP = 10;

// Puts a tooltip beside an icon, on the side facing the middle of its container, so it never hangs
// over the container's edge.
export const tooltipPlacement = (
  [x, y]: Point,
  half: number,
  container: { readonly width: number; readonly height: number },
): { left?: number; right?: number; top?: number; bottom?: number } => ({
  ...(x > container.width / 2
    ? { right: container.width - (x - half - TOOLTIP_GAP) }
    : { left: x + half + TOOLTIP_GAP }),
  ...(y > container.height / 2 ? { bottom: container.height - (y + half) } : { top: y - half }),
});

// The same for a box of any size, given relative to its container.
export const placementBeside = (
  box: {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
  },
  container: { readonly width: number; readonly height: number },
): { left?: number; right?: number; top?: number; bottom?: number } => ({
  ...(box.left + box.width / 2 > container.width / 2
    ? { right: container.width - box.left + TOOLTIP_GAP }
    : { left: box.left + box.width + TOOLTIP_GAP }),
  ...(box.top + box.height / 2 > container.height / 2
    ? { bottom: container.height - (box.top + box.height) }
    : { top: box.top }),
});
