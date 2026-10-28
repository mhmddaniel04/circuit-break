import { checkCircuitStructure, topologicalOrder } from '../graph';
import type { Circuit } from '../types';
import { notCircuit, twoInputCircuit, twoLayerCircuit } from './fixtures';

const loopCircuit: Circuit = {
  sources: [],
  slots: [{ id: 's1' }, { id: 's2' }],
  bulbs: [],
  wires: [
    { from: 's1', to: 's2' },
    { from: 's2', to: 's1' },
  ],
};

describe('topologicalOrder', () => {
  it('puts every node after the nodes that feed it', () => {
    const order = topologicalOrder(twoLayerCircuit)!;
    for (const wire of twoLayerCircuit.wires) {
      expect(order.indexOf(wire.from)).toBeLessThan(order.indexOf(wire.to));
    }
  });

  it('returns null when the circuit has a loop', () => {
    expect(topologicalOrder(loopCircuit)).toBeNull();
  });
});

describe('checkCircuitStructure', () => {
  it('accepts valid circuits', () => {
    for (const circuit of [notCircuit, twoInputCircuit, twoLayerCircuit]) {
      expect(checkCircuitStructure(circuit)).toEqual([]);
    }
  });

  it('reports a wire to an unknown node', () => {
    const circuit = { ...notCircuit, wires: [...notCircuit.wires, { from: 'A', to: 'ghost' }] };
    expect(checkCircuitStructure(circuit).join('\n')).toMatch(/unknown end node "ghost"/);
  });

  it('reports a bulb that sends power', () => {
    const circuit = {
      ...notCircuit,
      wires: [...notCircuit.wires, { from: 'Y', to: 's1', port: 1 }],
    };
    expect(checkCircuitStructure(circuit).join('\n')).toMatch(/a bulb cannot send power/);
  });

  it('reports two wires into the same input', () => {
    const circuit = {
      ...twoInputCircuit,
      wires: [
        { from: 'A', to: 's1', port: 0 },
        { from: 'B', to: 's1', port: 0 },
        { from: 's1', to: 'Y' },
      ],
    };
    expect(checkCircuitStructure(circuit).join('\n')).toMatch(/already connected/);
  });

  it('reports a locked gate with the wrong number of inputs', () => {
    const circuit = { ...notCircuit, slots: [{ id: 's1', fixedGate: 'AND' as const }] };
    expect(checkCircuitStructure(circuit).join('\n')).toMatch(/AND needs 2 input/);
  });

  it('reports a loop', () => {
    expect(checkCircuitStructure(loopCircuit)).toContain('Circuit contains a loop');
  });
});
