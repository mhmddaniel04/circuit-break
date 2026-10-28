import { getIncomingWires } from '@/features/simulation';
import type { Level } from '@/levels';

/** Size of one grid tile in SVG units. */
export const CELL = 100;
export const SLOT_HALF_WIDTH = 36;
export const SLOT_HALF_HEIGHT = 28;
export const SOURCE_RADIUS = 24;
export const BULB_RADIUS = 24;
/** Vertical distance of the two inputs of a 2-input gate from its centre. */
export const PORT_OFFSET = 12;
/** Sideways shift of a wire's vertical part per grid row, so wires from different rows don't overlap. */
export const LANE_SPACING = 10;

export interface Point {
  x: number;
  y: number;
}

export interface WireLayout {
  /** Position in `level.wires`, so it matches `evaluation.wires[index]`. */
  index: number;
  path: string;
}

type NodeKind = 'source' | 'slot' | 'bulb';
type Position = readonly [number, number];

export function cellCenter([col, row]: Position): Point {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

export function boardSize(level: Level): { width: number; height: number } {
  return { width: level.grid.cols * CELL, height: level.grid.rows * CELL };
}

/**
 * An SVG path that goes right, then up/down, then right again (like a circuit diagram).
 * `lane` moves the up/down part sideways so that wires from different rows stay apart.
 */
export function wirePath(start: Point, end: Point, lane = 0): string {
  if (start.y === end.y) return `M ${start.x} ${start.y} H ${end.x}`;
  const midX = Math.round((start.x + end.x) / 2 + lane);
  return `M ${start.x} ${start.y} H ${midX} V ${end.y} H ${end.x}`;
}

/** Works out where every wire starts and ends on the board. */
export function layoutWires(level: Level): WireLayout[] {
  const nodes = new Map<string, { kind: NodeKind; pos: Position }>();
  for (const { id, pos } of level.sources) nodes.set(id, { kind: 'source', pos });
  for (const { id, pos } of level.slots) nodes.set(id, { kind: 'slot', pos });
  for (const { id, pos } of level.bulbs) nodes.set(id, { kind: 'bulb', pos });
  const incoming = getIncomingWires(level);

  return level.wires.flatMap((wire, index) => {
    const from = nodes.get(wire.from);
    const to = nodes.get(wire.to);
    if (!from || !to) return [];

    const start = cellCenter(from.pos);
    start.x += from.kind === 'source' ? SOURCE_RADIUS : SLOT_HALF_WIDTH;

    const end = cellCenter(to.pos);
    if (to.kind === 'bulb') {
      end.x -= BULB_RADIUS;
    } else {
      end.x -= SLOT_HALF_WIDTH;
      if ((incoming.get(wire.to)?.length ?? 0) === 2) {
        end.y += (wire.port ?? 0) === 0 ? -PORT_OFFSET : PORT_OFFSET;
      }
    }

    // Wires from the same node share a lane (they carry the same signal); other rows get their own.
    const lane = (from.pos[1] - (level.grid.rows - 1) / 2) * LANE_SPACING;
    return [{ index, path: wirePath(start, end, lane) }];
  });
}
