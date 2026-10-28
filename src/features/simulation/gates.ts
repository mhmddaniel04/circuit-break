import type { Bit, GateType } from './types';

/** Number of inputs each gate needs. */
export const GATE_ARITY: Record<GateType, 1 | 2> = {
  AND: 2,
  OR: 2,
  NOT: 1,
  NAND: 2,
  NOR: 2,
  XOR: 2,
};

const toBit = (condition: boolean): Bit => (condition ? 1 : 0);

/** Computes the output of a single gate. */
export function applyGate(gate: GateType, inputs: readonly Bit[]): Bit {
  const arity = GATE_ARITY[gate];
  if (inputs.length !== arity) {
    throw new Error(`${gate} gate needs ${arity} input(s) but got ${inputs.length}`);
  }

  const [a, b] = inputs;
  switch (gate) {
    case 'NOT':
      return toBit(a === 0);
    case 'AND':
      return toBit(a === 1 && b === 1);
    case 'OR':
      return toBit(a === 1 || b === 1);
    case 'NAND':
      return toBit(!(a === 1 && b === 1));
    case 'NOR':
      return toBit(!(a === 1 || b === 1));
    case 'XOR':
      return toBit(a !== b);
  }
}

export interface TruthTableRow {
  inputs: Bit[];
  output: Bit;
}

/** Every input combination of a gate and its output (used by the Learn page and AI hints). */
export function truthTable(gate: GateType): TruthTableRow[] {
  const rows: Bit[][] =
    GATE_ARITY[gate] === 1
      ? [[0], [1]]
      : [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ];
  return rows.map((inputs) => ({ inputs, output: applyGate(gate, inputs) }));
}
