import type { Circuit } from '../types';

/** A ─► [s1] ─► Y   (one-input slot, needs NOT) */
export const notCircuit: Circuit = {
  sources: [{ id: 'A', value: 1 }],
  slots: [{ id: 's1' }],
  bulbs: [{ id: 'Y', target: 0 }],
  wires: [
    { from: 'A', to: 's1' },
    { from: 's1', to: 'Y' },
  ],
};

/** A, B ─► [s1] ─► Y   (two-input slot, A = 1, B = 0, Y must be 0) */
export const twoInputCircuit: Circuit = {
  sources: [
    { id: 'A', value: 1 },
    { id: 'B', value: 0 },
  ],
  slots: [{ id: 's1' }],
  bulbs: [{ id: 'Y', target: 0 }],
  wires: [
    { from: 'A', to: 's1', port: 0 },
    { from: 'B', to: 's1', port: 1 },
    { from: 's1', to: 'Y' },
  ],
};

/** Same board as twoInputCircuit, but Y must follow the full AND truth table. */
export const andTableCircuit: Circuit = {
  ...twoInputCircuit,
  cases: [
    { inputs: { A: 0, B: 0 }, targets: { Y: 0 } },
    { inputs: { A: 0, B: 1 }, targets: { Y: 0 } },
    { inputs: { A: 1, B: 0 }, targets: { Y: 0 } },
    { inputs: { A: 1, B: 1 }, targets: { Y: 1 } },
  ],
};

/**
 * Two layers. Solution: s1 = AND, s2 = NOT, s3 = AND.
 *
 *   A ─┐
 *      ├─► [s1] ─┐
 *   B ─┘         ├─► [s3] ─► Y
 *   C ───► [s2] ─┘
 */
export const twoLayerCircuit: Circuit = {
  sources: [
    { id: 'A', value: 1 },
    { id: 'B', value: 1 },
    { id: 'C', value: 0 },
  ],
  slots: [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
  bulbs: [{ id: 'Y', target: 1 }],
  wires: [
    { from: 'A', to: 's1', port: 0 },
    { from: 'B', to: 's1', port: 1 },
    { from: 'C', to: 's2' },
    { from: 's1', to: 's3', port: 0 },
    { from: 's2', to: 's3', port: 1 },
    { from: 's3', to: 'Y' },
  ],
};
