// The 2.5D city on the map page, drawn in an isometric view: x goes down-right, y goes
// down-left and z goes up. Kept apart from React so the drawing maths can be tested.

export const CITY_VIEWBOX = { width: 800, height: 620 };

const UNIT = 16;
const ORIGIN = { x: 372, y: 140 };

export type Point3 = readonly [number, number, number];

/** Where a point of the 3D city lands on the flat screen. */
export function project([x, y, z]: Point3): { x: number; y: number } {
  return {
    x: ORIGIN.x + (x - y) * 0.866 * UNIT,
    y: ORIGIN.y + (x + y) * 0.5 * UNIT - z * UNIT,
  };
}

const points = (corners: Point3[]) =>
  corners
    .map((corner) => {
      const { x, y } = project(corner);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

export interface Shape {
  points: string;
  /** A class name from the city's CSS module, which sets the colour. */
  tone: string;
}

/** The three faces of a box you can see: front-left, front-right and top. */
export function box(
  x: number,
  y: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  tone: string,
): Shape[] {
  const top = z + height;
  return [
    {
      points: points([
        [x, y + depth, z],
        [x + width, y + depth, z],
        [x + width, y + depth, top],
        [x, y + depth, top],
      ]),
      tone: `${tone}Left`,
    },
    {
      points: points([
        [x + width, y, z],
        [x + width, y + depth, z],
        [x + width, y + depth, top],
        [x + width, y, top],
      ]),
      tone: `${tone}Right`,
    },
    {
      points: points([
        [x, y, top],
        [x + width, y, top],
        [x + width, y + depth, top],
        [x, y + depth, top],
      ]),
      tone: `${tone}Top`,
    },
  ];
}

/** A flat square lying on the ground (or on a block), e.g. a copper pad or a highlight. */
export function tile(x: number, y: number, z: number, size: number, tone: string): Shape {
  return {
    points: points([
      [x, y, z],
      [x + size, y, z],
      [x + size, y + size, z],
      [x, y + size, z],
    ]),
    tone,
  };
}

/** A path along the ground through (x, y) corners, for the copper tracks between districts. */
export function groundPath(corners: readonly (readonly [number, number])[]): string {
  return corners
    .map(([x, y], i) => {
      const point = project([x, y, 0.02]);
      return `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(' ');
}

// ---------- The city plan ----------

export const DISTRICT_SIZE = 6;
const PLATFORM_HEIGHT = 0.6;

/** Where each district (world) sits on the board, and how tall its buildings are. */
export const DISTRICT_PLAN: Record<number, { x: number; y: number; heights: number[] }> = {
  1: { x: 1, y: 14, heights: [3, 4.2, 2.2, 3.4] },
  2: { x: 1, y: 2, heights: [3.6, 5, 2.6, 3] },
  3: { x: 11, y: 8, heights: [4, 5.6, 3, 3.8] },
  4: { x: 21, y: 2, heights: [3.2, 4.4, 2.4, 3.6] },
  5: { x: 21, y: 14, heights: [4.4, 6, 3, 2.6] },
};

/** The copper tracks that carry power from one district to the next. */
export const LINKS: { from: number; to: number; route: [number, number][] }[] = [
  {
    from: 1,
    to: 2,
    route: [
      [4, 14],
      [4, 8],
    ],
  },
  {
    from: 2,
    to: 3,
    route: [
      [7, 5],
      [9, 5],
      [9, 11],
      [11, 11],
    ],
  },
  {
    from: 3,
    to: 4,
    route: [
      [17, 11],
      [19, 11],
      [19, 5],
      [21, 5],
    ],
  },
  {
    from: 4,
    to: 5,
    route: [
      [24, 8],
      [24, 14],
    ],
  },
];

/** Four buildings per district: [x, y, width, depth] inside the 6 × 6 block. */
const FOOTPRINTS: [number, number, number, number][] = [
  [0.6, 0.6, 1.8, 1.8],
  [3.4, 0.6, 2, 1.6],
  [0.6, 3.4, 2.2, 2],
  [3.6, 3.2, 1.8, 2.2],
];

export type DistrictLook = 'powered' | 'active' | 'locked';

/**
 * One district's block and buildings. `lit` (0 to 1) is how many windows have their lights on:
 * the share of the district's levels the player has finished.
 */
export function districtShapes(
  world: number,
  look: DistrictLook,
  lit: number,
  selected: boolean,
): Shape[] {
  const plan = DISTRICT_PLAN[world];
  const dark = look === 'locked';
  const shapes = box(
    plan.x,
    plan.y,
    0,
    DISTRICT_SIZE,
    DISTRICT_SIZE,
    PLATFORM_HEIGHT,
    dark ? 'plateDark' : 'plate',
  );
  if (selected) {
    shapes.push(tile(plan.x, plan.y, PLATFORM_HEIGHT + 0.01, DISTRICT_SIZE, 'selected'));
  }

  let windowNumber = 0;
  FOOTPRINTS.forEach(([fx, fy, width, depth], i) => {
    const x = plan.x + fx;
    const y = plan.y + fy;
    const height = plan.heights[i];
    shapes.push(...box(x, y, PLATFORM_HEIGHT, width, depth, height, dark ? 'wallDark' : 'wall'));

    const windowTone = () => {
      windowNumber += 1;
      // Spread the lit windows around the district instead of filling them in order.
      const on = look === 'powered' || ((windowNumber * 7) % 10) / 10 < lit;
      return on ? 'windowOn' : dark ? 'windowDark' : 'windowOff';
    };
    for (let floor = 0; floor < Math.floor(height - 0.5); floor += 1) {
      const z = PLATFORM_HEIGHT + 0.45 + floor;
      for (let column = 0; column < Math.floor(width / 0.8); column += 1) {
        const wx = x + 0.25 + column * 0.8;
        shapes.push({
          points: points([
            [wx, y + depth, z],
            [wx + 0.45, y + depth, z],
            [wx + 0.45, y + depth, z + 0.5],
            [wx, y + depth, z + 0.5],
          ]),
          tone: windowTone(),
        });
      }
      for (let column = 0; column < Math.floor(depth / 0.8); column += 1) {
        const wy = y + 0.25 + column * 0.8;
        shapes.push({
          points: points([
            [x + width, wy, z],
            [x + width, wy + 0.45, z],
            [x + width, wy + 0.45, z + 0.5],
            [x + width, wy, z + 0.5],
          ]),
          tone: windowTone(),
        });
      }
    }
  });
  return shapes;
}

/**
 * Where each district's name tag goes. Districts at the back get theirs above the buildings;
 * the ones in front get theirs below the block, so no tag covers another district.
 */
const TAGS: Record<number, { at: Point3; place: 'above' | 'below' }> = {
  1: { at: [7, 20, 0], place: 'below' },
  2: { at: [4, 5, 7.2], place: 'above' },
  3: { at: [11, 14, 0.6], place: 'below' },
  4: { at: [24, 5, 7.2], place: 'above' },
  5: { at: [27, 20, 0], place: 'below' },
};

export function tagPosition(world: number): { x: number; y: number; place: 'above' | 'below' } {
  const tag = TAGS[world];
  return { ...project(tag.at), place: tag.place };
}

/** Districts in the order they must be drawn: the ones at the back first. */
export const DRAW_ORDER = Object.entries(DISTRICT_PLAN)
  .sort(([, a], [, b]) => a.x + a.y - (b.x + b.y))
  .map(([world]) => Number(world));

/** The circuit-board slab under the city, with a few chips and copper pads for texture. */
export function groundShapes(): Shape[] {
  const shapes = box(-1, -1, -0.9, 30, 24, 0.9, 'slab');
  for (const [x, y] of [
    [9, 1],
    [15, 18],
    [26, 10],
    [9, 20],
    [17, 2],
  ]) {
    shapes.push(...box(x, y, 0, 1.6, 1, 0.35, 'chip'));
  }
  for (const [x, y] of [
    [0, 9],
    [8, 12],
    [19, 20],
    [27, 22],
    [14, 0],
    [27, 0],
  ]) {
    shapes.push(tile(x, y, 0.01, 0.8, 'pad'));
  }
  return shapes;
}
