import { GATE_ARITY } from './gates';
import type { Circuit, Wire } from './types';

export type NodeKind = 'source' | 'slot' | 'bulb';

/** Maps every node id to its kind. */
export function getNodeKinds(circuit: Circuit): Map<string, NodeKind> {
  const kinds = new Map<string, NodeKind>();
  for (const { id } of circuit.sources) kinds.set(id, 'source');
  for (const { id } of circuit.slots) kinds.set(id, 'slot');
  for (const { id } of circuit.bulbs) kinds.set(id, 'bulb');
  return kinds;
}

/** Wires going INTO each node, sorted by input port. */
export function getIncomingWires(circuit: Circuit): Map<string, Wire[]> {
  const incoming = new Map<string, Wire[]>();
  for (const wire of circuit.wires) {
    const list = incoming.get(wire.to) ?? [];
    list.push(wire);
    incoming.set(wire.to, list);
  }
  for (const list of incoming.values()) {
    list.sort((a, b) => (a.port ?? 0) - (b.port ?? 0));
  }
  return incoming;
}

/**
 * Orders the nodes so each one comes after every node that feeds it (Kahn's algorithm).
 * Returns null if the circuit contains a loop.
 */
export function topologicalOrder(circuit: Circuit): string[] | null {
  const ids = [...getNodeKinds(circuit).keys()];
  const inDegree = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  for (const id of ids) {
    inDegree.set(id, 0);
    outgoing.set(id, []);
  }

  for (const { from, to } of circuit.wires) {
    if (!inDegree.has(from) || !inDegree.has(to)) continue;
    inDegree.set(to, inDegree.get(to)! + 1);
    outgoing.get(from)!.push(to);
  }

  const queue = ids.filter((id) => inDegree.get(id) === 0);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of outgoing.get(id)!) {
      const remaining = inDegree.get(next)! - 1;
      inDegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }

  return order.length === ids.length ? order : null;
}

/** Finds mistakes in how a circuit is wired. Returns an empty list when the circuit is valid. */
export function checkCircuitStructure(circuit: Circuit): string[] {
  const problems: string[] = [];

  const kinds = new Map<string, NodeKind>();
  const groups: Array<[NodeKind, readonly { id: string }[]]> = [
    ['source', circuit.sources],
    ['slot', circuit.slots],
    ['bulb', circuit.bulbs],
  ];
  for (const [kind, nodes] of groups) {
    for (const { id } of nodes) {
      if (kinds.has(id)) problems.push(`Duplicate node id "${id}"`);
      kinds.set(id, kind);
    }
  }

  const usedInputs = new Set<string>();
  for (const wire of circuit.wires) {
    const label = `Wire ${wire.from} → ${wire.to}`;
    const fromKind = kinds.get(wire.from);
    const toKind = kinds.get(wire.to);

    if (!fromKind) problems.push(`${label}: unknown start node "${wire.from}"`);
    else if (fromKind === 'bulb') problems.push(`${label}: a bulb cannot send power`);

    if (!toKind) problems.push(`${label}: unknown end node "${wire.to}"`);
    else if (toKind === 'source') problems.push(`${label}: a source cannot receive power`);

    const inputKey = `${wire.to}:${wire.port ?? 0}`;
    if (usedInputs.has(inputKey)) {
      problems.push(`${label}: input ${wire.port ?? 0} of "${wire.to}" is already connected`);
    }
    usedInputs.add(inputKey);
  }

  const incoming = getIncomingWires(circuit);
  for (const bulb of circuit.bulbs) {
    if ((incoming.get(bulb.id)?.length ?? 0) !== 1) {
      problems.push(`Bulb "${bulb.id}" must have exactly one wire going into it`);
    }
  }
  for (const slot of circuit.slots) {
    const count = incoming.get(slot.id)?.length ?? 0;
    if (count < 1 || count > 2) {
      problems.push(`Slot "${slot.id}" must have 1 or 2 input wires (has ${count})`);
    }
    if (slot.fixedGate && GATE_ARITY[slot.fixedGate] !== count) {
      problems.push(
        `Slot "${slot.id}": ${slot.fixedGate} needs ${GATE_ARITY[slot.fixedGate]} input(s) but ${count} are wired`,
      );
    }
  }

  if (topologicalOrder(circuit) === null) problems.push('Circuit contains a loop');

  return problems;
}
