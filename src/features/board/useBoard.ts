import { useMemo, useReducer } from 'react';
import { evaluateCircuit, getTestCases } from '@/features/simulation';
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

  // Power flows live: the board always shows what the circuit does for the row being viewed.
  const evaluation = useMemo(() => {
    const testCase = getTestCases(level)[state.viewedCase];
    return evaluateCircuit(level, state.placement, testCase?.inputs);
  }, [level, state.placement, state.viewedCase]);

  return { state, dispatch, evaluation };
}
