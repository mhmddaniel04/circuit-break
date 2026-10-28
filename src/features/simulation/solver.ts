import { checkSolution, slotAccepts } from './validate';
import type { Circuit, Placement, ToolboxItem } from './types';

/**
 * Tries every way of placing the toolbox gates into the open slots and returns the ones that work.
 * Used by tests (every level must be solvable) and later by the AI hint and the scoring system.
 */
export function findSolutions(
  circuit: Circuit,
  toolbox: readonly ToolboxItem[],
  limit = Infinity,
): Placement[] {
  const openSlots = circuit.slots.filter((slot) => !slot.fixedGate);
  const remaining = new Map(toolbox.map((item) => [item.gate, item.count] as const));
  const solutions: Placement[] = [];
  const placement: Placement = {};

  const search = (index: number): void => {
    if (solutions.length >= limit) return;

    if (index === openSlots.length) {
      if (checkSolution(circuit, placement).solved) solutions.push({ ...placement });
      return;
    }

    const slot = openSlots[index];
    for (const [gate, count] of remaining) {
      if (count === 0 || !slotAccepts(circuit, slot.id, gate)) continue;
      remaining.set(gate, count - 1);
      placement[slot.id] = gate;
      search(index + 1);
      delete placement[slot.id];
      remaining.set(gate, count);
    }
  };

  search(0);
  return solutions;
}
