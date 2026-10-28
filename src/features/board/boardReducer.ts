import {
  checkSolution,
  GATE_ARITY,
  slotAccepts,
  type CheckResult,
  type GateType,
  type Placement,
} from '@/features/simulation';
import { getInitialPlacement, type Level } from '@/levels';

/** Feedback shown under the board. `key` matches a text in i18n "level.messages". */
export type BoardMessage =
  | { key: 'wrongInputs'; gate: GateType; count: number }
  | { key: 'noneLeft'; gate: GateType }
  | { key: 'locked' }
  | { key: 'emptySlots'; count: number }
  | { key: 'notSolved' }
  | { key: 'solved' };

export interface BoardState {
  placement: Placement;
  selectedGate: GateType | null;
  /** Earlier placements, for Undo. */
  history: Placement[];
  /** Result of the last "Test Circuit". Cleared when the board changes. */
  result: CheckResult | null;
  /** Which test case the board is showing (truth-table levels). */
  viewedCase: number;
  message: BoardMessage | null;
  /** How many times the player pressed "Test Circuit" (used for scoring later). */
  attempts: number;
}

export type BoardAction =
  | { type: 'selectGate'; gate: GateType }
  | { type: 'clickSlot'; slotId: string }
  | { type: 'placeGate'; slotId: string; gate: GateType }
  | { type: 'undo' }
  | { type: 'reset' }
  | { type: 'test' }
  | { type: 'viewCase'; index: number };

export function createInitialState(level: Level): BoardState {
  return {
    placement: getInitialPlacement(level),
    selectedGate: null,
    history: [],
    result: null,
    viewedCase: 0,
    message: null,
    attempts: 0,
  };
}

/** How many more of `gate` the player can still place. */
export function getRemaining(level: Level, placement: Placement, gate: GateType): number {
  const total = level.toolbox.find((item) => item.gate === gate)?.count ?? 0;
  const used = Object.values(placement).filter((placed) => placed === gate).length;
  return Math.max(0, total - used);
}

/** Saves a new placement and clears the old test result. */
function commit(
  state: BoardState,
  placement: Placement,
  selectedGate: GateType | null,
): BoardState {
  return {
    ...state,
    placement,
    selectedGate,
    history: [...state.history, state.placement],
    result: null,
    viewedCase: 0,
    message: null,
  };
}

function placeGate(level: Level, state: BoardState, slotId: string, gate: GateType): BoardState {
  const slot = level.slots.find((s) => s.id === slotId);
  if (!slot) return state;
  if (slot.fixedGate) return { ...state, message: { key: 'locked' } };
  if (!slotAccepts(level, slotId, gate)) {
    return { ...state, message: { key: 'wrongInputs', gate, count: GATE_ARITY[gate] } };
  }
  if (state.placement[slotId] === gate) return state;
  if (getRemaining(level, state.placement, gate) === 0) {
    return { ...state, message: { key: 'noneLeft', gate } };
  }

  const placement = { ...state.placement, [slotId]: gate };
  // Keep the gate selected while more of it are left, so the player can place several quickly.
  const stillSelected = getRemaining(level, placement, gate) > 0 ? gate : null;
  return commit(state, placement, stillSelected);
}

function removeGate(state: BoardState, slotId: string): BoardState {
  if (!state.placement[slotId]) return state;
  const placement = { ...state.placement };
  delete placement[slotId];
  return commit(state, placement, state.selectedGate);
}

export function boardReducer(level: Level, state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'selectGate': {
      if (state.selectedGate === action.gate) {
        return { ...state, selectedGate: null, message: null };
      }
      if (getRemaining(level, state.placement, action.gate) === 0) {
        return { ...state, message: { key: 'noneLeft', gate: action.gate } };
      }
      return { ...state, selectedGate: action.gate, message: null };
    }

    case 'clickSlot': {
      const slot = level.slots.find((s) => s.id === action.slotId);
      if (!slot) return state;
      if (slot.fixedGate) return { ...state, message: { key: 'locked' } };
      if (state.selectedGate) return placeGate(level, state, action.slotId, state.selectedGate);
      return removeGate(state, action.slotId);
    }

    case 'placeGate':
      return placeGate(level, state, action.slotId, action.gate);

    case 'undo': {
      const previous = state.history.at(-1);
      if (!previous) return state;
      return {
        ...state,
        placement: previous,
        history: state.history.slice(0, -1),
        result: null,
        viewedCase: 0,
        message: null,
      };
    }

    case 'reset':
      return { ...createInitialState(level), attempts: state.attempts };

    case 'test': {
      const result = checkSolution(level, state.placement);
      if (result.emptySlots.length > 0) {
        return {
          ...state,
          result: null,
          message: { key: 'emptySlots', count: result.emptySlots.length },
        };
      }
      const firstFailed = result.cases.findIndex((testCase) => !testCase.passed);
      return {
        ...state,
        result,
        viewedCase: Math.max(0, firstFailed),
        attempts: state.attempts + 1,
        selectedGate: null,
        message: { key: result.solved ? 'solved' : 'notSolved' },
      };
    }

    case 'viewCase':
      if (!state.result || !state.result.cases[action.index]) return state;
      return { ...state, viewedCase: action.index };
  }
}
