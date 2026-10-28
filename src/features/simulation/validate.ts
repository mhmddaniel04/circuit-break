import { evaluateCircuit, getEffectiveGate } from './evaluate';
import { GATE_ARITY } from './gates';
import { getIncomingWires } from './graph';
import type { Bit, Circuit, GateType, Placement, Signal, TestCase } from './types';

export interface BulbResult {
  id: string;
  expected: Bit;
  actual: Signal;
  correct: boolean;
}

export interface CaseResult {
  inputs: Record<string, Bit>;
  bulbs: BulbResult[];
  passed: boolean;
}

export interface CheckResult {
  /** True when every slot is filled and every test case passes. */
  solved: boolean;
  emptySlots: string[];
  cases: CaseResult[];
}

/** The level's truth-table cases, or a single case built from the source values and bulb targets. */
export function getTestCases(circuit: Circuit): readonly TestCase[] {
  if (circuit.cases && circuit.cases.length > 0) return circuit.cases;
  return [
    {
      inputs: Object.fromEntries(circuit.sources.map((s) => [s.id, s.value] as const)),
      targets: Object.fromEntries(circuit.bulbs.map((b) => [b.id, b.target] as const)),
    },
  ];
}

/** Slots that still have no gate. */
export function findEmptySlots(circuit: Circuit, placement: Placement): string[] {
  return circuit.slots
    .filter((slot) => getEffectiveGate(slot, placement) === null)
    .map((slot) => slot.id);
}

/** Whether the player may put `gate` into the slot (the slot is not locked and the input count fits). */
export function slotAccepts(circuit: Circuit, slotId: string, gate: GateType): boolean {
  const slot = circuit.slots.find((s) => s.id === slotId);
  if (!slot || slot.fixedGate) return false;
  const inputCount = getIncomingWires(circuit).get(slotId)?.length ?? 0;
  return GATE_ARITY[gate] === inputCount;
}

/** Runs every test case. This is what the "Test Circuit" button calls. */
export function checkSolution(circuit: Circuit, placement: Placement): CheckResult {
  const emptySlots = findEmptySlots(circuit, placement);

  const cases = getTestCases(circuit).map((testCase): CaseResult => {
    const { nodes } = evaluateCircuit(circuit, placement, testCase.inputs);
    const bulbs = Object.entries(testCase.targets).map(([id, expected]): BulbResult => {
      const actual = nodes[id] ?? null;
      return { id, expected, actual, correct: actual === expected };
    });
    return { inputs: testCase.inputs, bulbs, passed: bulbs.every((bulb) => bulb.correct) };
  });

  return {
    solved: emptySlots.length === 0 && cases.every((c) => c.passed),
    emptySlots,
    cases,
  };
}
