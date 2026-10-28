import { applyGate, truthTable } from '../gates';
import type { Bit, GateType } from '../types';

describe('applyGate', () => {
  it.each<[GateType, Bit[], Bit]>([
    ['NOT', [0], 1],
    ['NOT', [1], 0],
    ['AND', [0, 0], 0],
    ['AND', [0, 1], 0],
    ['AND', [1, 0], 0],
    ['AND', [1, 1], 1],
    ['OR', [0, 0], 0],
    ['OR', [0, 1], 1],
    ['OR', [1, 0], 1],
    ['OR', [1, 1], 1],
    ['NAND', [0, 0], 1],
    ['NAND', [1, 1], 0],
    ['NOR', [0, 0], 1],
    ['NOR', [0, 1], 0],
    ['XOR', [0, 1], 1],
    ['XOR', [1, 1], 0],
  ])('%s %j → %i', (gate, inputs, expected) => {
    expect(applyGate(gate, inputs)).toBe(expected);
  });

  it('throws when given the wrong number of inputs', () => {
    expect(() => applyGate('AND', [1])).toThrow();
    expect(() => applyGate('NOT', [1, 0])).toThrow();
  });
});

describe('truthTable', () => {
  it('has 2 rows for NOT and 4 rows for two-input gates', () => {
    expect(truthTable('NOT')).toHaveLength(2);
    expect(truthTable('AND')).toHaveLength(4);
  });

  it('gives the correct outputs for AND and OR', () => {
    expect(truthTable('AND').map((row) => row.output)).toEqual([0, 0, 0, 1]);
    expect(truthTable('OR').map((row) => row.output)).toEqual([0, 1, 1, 1]);
  });
});
