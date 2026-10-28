import { useMemo, useReducer } from 'react';
import { evaluateCircuit } from '@/features/simulation';
import type { Level } from '@/levels';
import {
  boardReducer,
  createInitialState,
  type BoardAction,
  type BoardState,
} from './boardReducer';

/** All the state of one level being played. */
export function useBoard(level: Level) {
  const [state, dispatch] = useReducer(
    (current: BoardState, action: BoardAction) => boardReducer(level, current, action),
    level,
    createInitialState,
  );

  // Power only flows on the board after "Test Circuit" is pressed.
  const evaluation = useMemo(() => {
    if (!state.result) return null;
    const testCase = state.result.cases[state.viewedCase];
    return evaluateCircuit(level, state.placement, testCase?.inputs);
  }, [level, state.placement, state.result, state.viewedCase]);

  return { state, dispatch, evaluation };
}
