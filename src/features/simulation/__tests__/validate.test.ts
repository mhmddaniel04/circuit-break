import { checkSolution, getTestCases, slotAccepts } from '../validate';
import { andTableCircuit, notCircuit, twoInputCircuit, twoLayerCircuit } from './fixtures';

describe('checkSolution', () => {
  it('is solved when every bulb matches its target', () => {
    expect(checkSolution(notCircuit, { s1: 'NOT' }).solved).toBe(true);
  });

  it('is not solved with the wrong gate, and shows which bulb is wrong', () => {
    const result = checkSolution(twoInputCircuit, { s1: 'OR' });
    expect(result.solved).toBe(false);
    expect(result.cases[0].bulbs[0]).toEqual({ id: 'Y', expected: 0, actual: 1, correct: false });
  });

  it('lists the empty slots', () => {
    const result = checkSolution(twoLayerCircuit, { s1: 'AND' });
    expect(result.solved).toBe(false);
    expect(result.emptySlots).toEqual(['s2', 's3']);
  });

  it('checks every truth-table case', () => {
    expect(checkSolution(andTableCircuit, { s1: 'AND' }).solved).toBe(true);
    expect(checkSolution(andTableCircuit, { s1: 'OR' }).solved).toBe(false);
    expect(checkSolution(andTableCircuit, { s1: 'XOR' }).cases.map((c) => c.passed)).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });
});

describe('getTestCases', () => {
  it('builds one case from the source values when the level has no cases', () => {
    expect(getTestCases(twoInputCircuit)).toEqual([{ inputs: { A: 1, B: 0 }, targets: { Y: 0 } }]);
  });

  it('uses the level cases when there are some', () => {
    expect(getTestCases(andTableCircuit)).toHaveLength(4);
  });
});

describe('slotAccepts', () => {
  it('accepts a gate with the right number of inputs', () => {
    expect(slotAccepts(notCircuit, 's1', 'NOT')).toBe(true);
    expect(slotAccepts(twoInputCircuit, 's1', 'AND')).toBe(true);
  });

  it('rejects a gate with the wrong number of inputs', () => {
    expect(slotAccepts(notCircuit, 's1', 'AND')).toBe(false);
    expect(slotAccepts(twoInputCircuit, 's1', 'NOT')).toBe(false);
  });

  it('rejects locked slots and unknown slots', () => {
    const locked = { ...notCircuit, slots: [{ id: 's1', fixedGate: 'NOT' as const }] };
    expect(slotAccepts(locked, 's1', 'NOT')).toBe(false);
    expect(slotAccepts(notCircuit, 'nope', 'NOT')).toBe(false);
  });
});
