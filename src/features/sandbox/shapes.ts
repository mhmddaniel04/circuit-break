import type { ExprToken, PracticeQuestion } from '@/features/practice';
import { outputExpression } from '@/features/practice';
import {
  GATE_TYPES,
  getEffectiveGate,
  topologicalOrder,
  type Bit,
  type Placement,
} from '@/features/simulation';
import type { Level } from '@/levels';

type Pos = [number, number];

interface ShapePlan {
  id: string;
  inputs: [string, Pos][];
  slots: [string, Pos][];
  wires: { from: string; to: string; port?: number }[];
  bulb: Pos;
  grid: { cols: number; rows: number };
}

/** Every combination of the inputs, so the switches can be flipped to any row. */
function allRows(inputs: string[]) {
  return Array.from({ length: 2 ** inputs.length }, (_, row) => ({
    inputs: Object.fromEntries(
      inputs.map((name, i) => [name, ((row >> (inputs.length - 1 - i)) & 1) as Bit]),
    ),
    // The sandbox has no goal: these are never checked.
    targets: { Y: 0 as Bit },
  }));
}

function toLevel(plan: ShapePlan): Level {
  return {
    id: `sandbox-${plan.id}`,
    world: 0,
    order: 1,
    title: { en: 'Sandbox', ms: 'Kotak Pasir' },
    concept: { en: 'Build anything.', ms: 'Bina apa sahaja.' },
    hint: { en: 'Try every gate!', ms: 'Cuba setiap get!' },
    objective: 2,
    grid: plan.grid,
    sources: plan.inputs.map(([id, pos]) => ({ id, pos, value: 0 })),
    bulbs: [{ id: 'Y', pos: plan.bulb, target: 0 }],
    slots: plan.slots.map(([id, pos]) => ({ id, pos })),
    wires: plan.wires,
    cases: allRows(plan.inputs.map(([id]) => id)),
    // Plenty of every gate: the sandbox has no limits.
    toolbox: GATE_TYPES.map((gate) => ({ gate, count: 9 })),
    par: { gates: plan.slots.length, seconds: 60 },
  };
}

/** The circuit shapes the sandbox offers, from simple to bigger. */
export const SANDBOX_SHAPES: Level[] = [
  {
    id: 'single',
    inputs: [
      ['A', [0, 0]],
      ['B', [0, 2]],
    ],
    slots: [['P', [2, 1]]],
    wires: [
      { from: 'A', to: 'P', port: 0 },
      { from: 'B', to: 'P', port: 1 },
      { from: 'P', to: 'Y' },
    ],
    bulb: [4, 1],
    grid: { cols: 5, rows: 3 },
  },
  {
    id: 'notThen',
    inputs: [
      ['A', [0, 0]],
      ['B', [0, 2]],
    ],
    slots: [
      ['P', [2, 0]],
      ['Q', [4, 1]],
    ],
    wires: [
      { from: 'A', to: 'P' },
      { from: 'P', to: 'Q', port: 0 },
      { from: 'B', to: 'Q', port: 1 },
      { from: 'Q', to: 'Y' },
    ],
    bulb: [6, 1],
    grid: { cols: 7, rows: 3 },
  },
  {
    id: 'chain',
    inputs: [
      ['A', [0, 0]],
      ['B', [0, 1]],
      ['C', [0, 2]],
    ],
    slots: [
      ['P', [2, 0]],
      ['Q', [4, 1]],
    ],
    wires: [
      { from: 'A', to: 'P', port: 0 },
      { from: 'B', to: 'P', port: 1 },
      { from: 'P', to: 'Q', port: 0 },
      { from: 'C', to: 'Q', port: 1 },
      { from: 'Q', to: 'Y' },
    ],
    bulb: [6, 1],
    grid: { cols: 7, rows: 3 },
  },
  {
    id: 'tree',
    inputs: [
      ['A', [0, 0]],
      ['B', [0, 1]],
      ['C', [0, 2]],
      ['D', [0, 3]],
    ],
    slots: [
      ['P', [2, 0]],
      ['Q', [2, 3]],
      ['R', [4, 2]],
    ],
    wires: [
      { from: 'A', to: 'P', port: 0 },
      { from: 'B', to: 'P', port: 1 },
      { from: 'C', to: 'Q', port: 0 },
      { from: 'D', to: 'Q', port: 1 },
      { from: 'P', to: 'R', port: 0 },
      { from: 'Q', to: 'R', port: 1 },
      { from: 'R', to: 'Y' },
    ],
    bulb: [6, 2],
    grid: { cols: 7, rows: 4 },
  },
].map((plan) => toLevel(plan as ShapePlan));

/**
 * The Boolean expression of what the player built, e.g. Y = (A + B) · C̄,
 * or null while a slot is still empty.
 */
export function sandboxExpression(level: Level, placement: Placement): ExprToken[] | null {
  const order = (topologicalOrder(level) ?? []).filter((id) =>
    level.slots.some((slot) => slot.id === id),
  );
  const columns: PracticeQuestion['columns'] = [];
  for (const id of order) {
    const slot = level.slots.find((s) => s.id === id)!;
    const gate = getEffectiveGate(slot, placement);
    if (!gate) return null;
    const from = level.wires
      .filter((wire) => wire.to === id)
      .sort((a, b) => (a.port ?? 0) - (b.port ?? 0))
      .map((wire) => wire.from);
    columns.push({ name: id, gate, from });
  }
  return outputExpression({ inputs: level.sources.map((source) => source.id), columns });
}
