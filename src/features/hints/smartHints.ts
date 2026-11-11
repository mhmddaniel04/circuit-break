import {
  applyGate,
  checkSolution,
  evaluateCircuit,
  getEffectiveGate,
  getIncomingWires,
  getTestCases,
  topologicalOrder,
  type Bit,
  type GateType,
  type Placement,
} from '@/features/simulation';
import type { Level } from '@/levels';
import { closestSolution } from './hintRequest';

/**
 * What an instant hint points at, worked out from the level's solution.
 * `inputs` and the outputs are the signals at that one slot for one row of the truth table.
 */
export type HintPlan =
  | { kind: 'solved' }
  | { kind: 'empty'; slotId: string; correct: GateType; inputs: Bit[]; needs: Bit }
  | {
      kind: 'wrong';
      slotId: string;
      correct: GateType;
      placed: GateType;
      inputs: Bit[];
      gives: Bit;
      needs: Bit;
    };

interface SlotRow {
  inputs: Bit[];
  needs: Bit;
}

/** For one slot: the signals going in and the output the correct circuit needs, row by row. */
function slotRows(level: Level, solution: Placement, slotId: string): SlotRow[] {
  const wires = getIncomingWires(level).get(slotId) ?? [];
  const rows = getTestCases(level).map((testCase) => {
    const { nodes } = evaluateCircuit(level, solution, testCase.inputs);
    return {
      inputs: wires.map((wire) => nodes[wire.from] as Bit),
      needs: nodes[slotId] as Bit,
    };
  });
  // Each combination of inputs only once.
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = row.inputs.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Finds the first slot (from the inputs towards the bulbs) that is empty or holds a gate that
 * gives the wrong output, and one row that shows the problem.
 */
export function planHint(level: Level, placement: Placement): HintPlan {
  if (checkSolution(level, placement).solved) return { kind: 'solved' };
  const solution = closestSolution(level, placement);

  const order = topologicalOrder(level) ?? [];
  const slots = order
    .map((id) => level.slots.find((slot) => slot.id === id))
    .filter((slot) => slot !== undefined);

  for (const slot of slots) {
    if (slot.fixedGate) continue;
    const correct = solution[slot.id];
    if (!correct) continue;
    const placed = getEffectiveGate(slot, placement);
    const rows = slotRows(level, solution, slot.id);

    if (!placed) {
      // Show the row whose output is the rare one (AND's single 1, OR's single 0): it says most.
      const ones = rows.filter((row) => row.needs === 1).length;
      const rare: Bit = ones <= rows.length - ones ? 1 : 0;
      const row = rows.find((r) => r.needs === rare) ?? rows[0];
      return { kind: 'empty', slotId: slot.id, correct, ...row };
    }

    const mismatch = rows.find((row) => applyGate(placed, row.inputs) !== row.needs);
    if (mismatch) {
      return {
        kind: 'wrong',
        slotId: slot.id,
        correct,
        placed,
        inputs: mismatch.inputs,
        gives: applyGate(placed, mismatch.inputs),
        needs: mismatch.needs,
      };
    }
  }
  return { kind: 'solved' };
}

type Translate = (key: string, values?: Record<string, unknown>) => string;

const listInputs = (inputs: Bit[], t: Translate) =>
  inputs.length === 1 ? String(inputs[0]) : inputs.join(` ${t('hints.and')} `);

/** Hint 2 points at the problem; hint 3 names the gate for that slot. */
export function smartHintText(plan: HintPlan, step: 2 | 3, t: Translate): string {
  if (plan.kind === 'solved') return t('hints.solved');
  if (step === 3) {
    return `${t('hints.answer', { gate: plan.correct })} ${t(`learn.gates.${plan.correct}`)}`;
  }
  const inputs = listInputs(plan.inputs, t);
  return plan.kind === 'empty'
    ? t('hints.emptySlot', { inputs, needs: plan.needs })
    : t('hints.wrongGate', { gate: plan.placed, inputs, gives: plan.gives, needs: plan.needs });
}
