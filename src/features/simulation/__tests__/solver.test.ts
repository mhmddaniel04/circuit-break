import { findSolutions } from '../solver';
import { andTableCircuit, twoInputCircuit, twoLayerCircuit } from './fixtures';

describe('findSolutions', () => {
  it('finds the only gate that matches the AND truth table', () => {
    const toolbox = [
      { gate: 'AND' as const, count: 1 },
      { gate: 'OR' as const, count: 1 },
    ];
    expect(findSolutions(andTableCircuit, toolbox)).toEqual([{ s1: 'AND' }]);
  });

  it('solves a two-layer circuit', () => {
    const toolbox = [
      { gate: 'AND' as const, count: 2 },
      { gate: 'NOT' as const, count: 1 },
    ];
    expect(findSolutions(twoLayerCircuit, toolbox)).toEqual([{ s1: 'AND', s2: 'NOT', s3: 'AND' }]);
  });

  it('respects how many of each gate the toolbox has', () => {
    const toolbox = [
      { gate: 'AND' as const, count: 1 },
      { gate: 'NOT' as const, count: 1 },
    ];
    expect(findSolutions(twoLayerCircuit, toolbox)).toEqual([]);
  });

  it('finds every solution, or stops early at the limit', () => {
    // A = 1, B = 0, Y must be 0: both AND and NOR give 0.
    const toolbox = [
      { gate: 'AND' as const, count: 1 },
      { gate: 'NOR' as const, count: 1 },
    ];
    expect(findSolutions(twoInputCircuit, toolbox)).toHaveLength(2);
    expect(findSolutions(twoInputCircuit, toolbox, 1)).toHaveLength(1);
  });
});
