import { applyGate, GATE_ARITY } from './gates';
import { getIncomingWires, topologicalOrder } from './graph';
import type { Bit, Circuit, GateType, Placement, Signal, SlotNode } from './types';

export interface Evaluation {
  /** Output signal of every node. For bulbs, the signal they receive. */
  nodes: Record<string, Signal>;
  /** Signal carried by each wire, in the same order as `circuit.wires`. Used to draw glowing wires. */
  wires: Signal[];
}

/** The gate in a slot: the locked gate if there is one, otherwise the player's gate. */
export function getEffectiveGate(slot: SlotNode, placement: Placement): GateType | null {
  return slot.fixedGate ?? placement[slot.id] ?? null;
}

function evaluateSlot(gate: GateType | null, signals: Signal[]): Signal {
  if (!gate || signals.length !== GATE_ARITY[gate]) return null;
  if (signals.some((signal) => signal === null)) return null;
  return applyGate(gate, signals as Bit[]);
}

/**
 * Sends power through the circuit and returns the signal at every node and wire.
 * `inputs` overrides the source values (used for truth-table test cases).
 */
export function evaluateCircuit(
  circuit: Circuit,
  placement: Placement = {},
  inputs: Readonly<Record<string, Bit>> = {},
): Evaluation {
  const order = topologicalOrder(circuit);
  if (!order) throw new Error('Cannot evaluate a circuit that contains a loop');

  const incoming = getIncomingWires(circuit);
  const sources = new Map(circuit.sources.map((source) => [source.id, source] as const));
  const slots = new Map(circuit.slots.map((slot) => [slot.id, slot] as const));
  const nodes: Record<string, Signal> = {};

  const signalsInto = (id: string): Signal[] =>
    (incoming.get(id) ?? []).map((wire) => nodes[wire.from] ?? null);

  for (const id of order) {
    const source = sources.get(id);
    if (source) {
      nodes[id] = inputs[id] ?? source.value;
      continue;
    }

    const slot = slots.get(id);
    if (slot) {
      nodes[id] = evaluateSlot(getEffectiveGate(slot, placement), signalsInto(id));
      continue;
    }

    // Bulb: it shows whatever signal reaches it.
    nodes[id] = signalsInto(id)[0] ?? null;
  }

  return {
    nodes,
    wires: circuit.wires.map((wire) => nodes[wire.from] ?? null),
  };
}
