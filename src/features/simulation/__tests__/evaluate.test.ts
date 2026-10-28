import { evaluateCircuit } from '../evaluate';
import { notCircuit, twoInputCircuit, twoLayerCircuit } from './fixtures';

describe('evaluateCircuit', () => {
  it('sends power through a placed NOT gate', () => {
    const { nodes } = evaluateCircuit(notCircuit, { s1: 'NOT' });
    expect(nodes.A).toBe(1);
    expect(nodes.s1).toBe(0);
    expect(nodes.Y).toBe(0);
  });

  it('gives no power (null) after an empty slot', () => {
    const { nodes } = evaluateCircuit(notCircuit, {});
    expect(nodes.s1).toBeNull();
    expect(nodes.Y).toBeNull();
  });

  it('gives no power when the gate does not fit the slot', () => {
    expect(evaluateCircuit(notCircuit, { s1: 'AND' }).nodes.Y).toBeNull();
  });

  it('evaluates a two-layer circuit', () => {
    const { nodes } = evaluateCircuit(twoLayerCircuit, { s1: 'AND', s2: 'NOT', s3: 'AND' });
    expect(nodes.s1).toBe(1);
    expect(nodes.s2).toBe(1);
    expect(nodes.Y).toBe(1);
  });

  it('uses input overrides instead of the source values', () => {
    expect(evaluateCircuit(twoInputCircuit, { s1: 'AND' }).nodes.Y).toBe(0);
    expect(evaluateCircuit(twoInputCircuit, { s1: 'AND' }, { A: 1, B: 1 }).nodes.Y).toBe(1);
  });

  it('reports the signal on every wire', () => {
    expect(evaluateCircuit(notCircuit, { s1: 'NOT' }).wires).toEqual([1, 0]);
  });

  it('uses a locked gate even when the player placed nothing', () => {
    const circuit = { ...notCircuit, slots: [{ id: 's1', fixedGate: 'NOT' as const }] };
    expect(evaluateCircuit(circuit).nodes.Y).toBe(0);
  });

  it('throws when the circuit has a loop', () => {
    const circuit = {
      ...notCircuit,
      wires: [...notCircuit.wires, { from: 's1', to: 's1', port: 1 }],
    };
    expect(() => evaluateCircuit(circuit)).toThrow(/loop/);
  });
});
