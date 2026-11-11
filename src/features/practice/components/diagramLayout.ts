import { GATE_ARITY, type GateType } from '@/features/simulation';
import type { PracticeQuestion } from '../question';

// Sizes in SVG units. Gate symbols are drawn around (0, 0) with pins at x = ±36.
const ROW = 70;
const TOP = 40;
const LEFT = 40;
const STEP = 150;
const PIN = 36;
const GATE_HALF_HEIGHT = 22;

export interface PlacedGate {
  name: string;
  gate: GateType;
  x: number;
  y: number;
}

export interface DiagramLayout {
  width: number;
  height: number;
  /** Usually 0; negative when a wire goes around above the top row. */
  top: number;
  inputs: { name: string; x: number; y: number }[];
  gates: PlacedGate[];
  wires: { d: string }[];
}

interface Point {
  x: number;
  y: number;
}

/** Works out where each input, gate and wire goes. Kept apart from React so it can be tested. */
export function layoutQuestion(question: PracticeQuestion): DiagramLayout {
  const outputs = new Map<string, Point>();
  const depth = new Map<string, number>();

  const inputs = question.inputs.map((name, i) => {
    const point = { x: LEFT, y: TOP + i * ROW };
    outputs.set(name, point);
    depth.set(name, 0);
    return { name, ...point };
  });

  // Each gate goes one step to the right of its deepest input, at the average height of its inputs.
  const gates: PlacedGate[] = [];
  for (const column of question.columns) {
    const level = 1 + Math.max(...column.from.map((from) => depth.get(from)!));
    const ys = column.from.map((from) => outputs.get(from)!.y);
    let y = ys.reduce((sum, value) => sum + value, 0) / ys.length;
    // Keep gates in the same step from overlapping.
    while (gates.some((gate) => depth.get(gate.name) === level && Math.abs(gate.y - y) < ROW)) {
      y += ROW / 2;
    }
    const gate = { name: column.name, gate: column.gate, x: LEFT + level * STEP, y };
    gates.push(gate);
    depth.set(column.name, level);
    outputs.set(column.name, { x: gate.x + PIN, y });
  }

  const wires: { d: string }[] = [];
  gates.forEach((gate, gateIndex) => {
    const column = question.columns[gateIndex];
    const pins = GATE_ARITY[column.gate] === 1 ? [gate.y] : [gate.y - 12, gate.y + 12];
    // Sort the inputs so the upper source goes to the upper pin and wires do not cross.
    const sources = column.from.map((from) => outputs.get(from)!).sort((a, b) => a.y - b.y);
    sources.forEach((source, i) => {
      const pin = { x: gate.x - PIN, y: pins[i] };
      wires.push({ d: route(source, pin, i, gates) });
    });
  });

  // The output Y continues to the right edge, with its name.
  const last = gates[gates.length - 1];
  const width = last.x + PIN + 70;
  wires.push({ d: `M ${last.x + PIN} ${last.y} H ${width - 30}` });

  // Make room for every wire, including ones that go around above or below the gates.
  const wireYs = wires.flatMap((wire) => pathYs(wire.d));
  const highest = Math.min(0, ...wireYs) - 10;
  const lowest = Math.max(
    ...inputs.map((i) => i.y),
    ...gates.map((g) => g.y + GATE_HALF_HEIGHT),
    ...wireYs,
  );
  return { width, height: lowest + TOP, top: highest, inputs, gates, wires };
}

/**
 * A wire with right angles. It turns down either just before the gate it feeds or straight after
 * it leaves its source, whichever does not run through another gate. If both would, it goes
 * around: above or below all the gates.
 */
function route(from: Point, to: Point, lane: number, gates: PlacedGate[]): string {
  const late = to.x - 18 - lane * 10;
  const early = from.x + 18 + lane * 10;
  const clear = (y: number, x1: number, x2: number) => !crossesGate(y, x1, x2, gates);

  if (clear(from.y, from.x, late) && clear(to.y, late, to.x)) {
    return `M ${from.x} ${from.y} H ${late} V ${to.y} H ${to.x}`;
  }
  if (clear(from.y, from.x, early) && clear(to.y, early, to.x)) {
    return `M ${from.x} ${from.y} H ${early} V ${to.y} H ${to.x}`;
  }
  const top = Math.min(...gates.map((gate) => gate.y)) - GATE_HALF_HEIGHT - 14 - lane * 10;
  const bottom = Math.max(...gates.map((gate) => gate.y)) + GATE_HALF_HEIGHT + 14 + lane * 10;
  const around = Math.abs(top - from.y) <= Math.abs(bottom - from.y) ? top : bottom;
  return `M ${from.x} ${from.y} H ${early} V ${around} H ${late} V ${to.y} H ${to.x}`;
}

/** Does a horizontal line at height y, from x1 to x2, pass through a gate symbol? */
export function crossesGate(y: number, x1: number, x2: number, gates: PlacedGate[]): boolean {
  const [left, right] = x1 < x2 ? [x1, x2] : [x2, x1];
  return gates.some(
    (gate) =>
      Math.abs(gate.y - y) < GATE_HALF_HEIGHT &&
      gate.x - PIN + 2 < right &&
      gate.x + PIN - 2 > left,
  );
}

/** The heights a path "M x y H x V y …" visits. */
function pathYs(d: string): number[] {
  const parts = d.split(' ');
  const ys = [Number(parts[2])];
  for (let i = 3; i < parts.length; i += 2) {
    if (parts[i] === 'V') ys.push(Number(parts[i + 1]));
  }
  return ys;
}
