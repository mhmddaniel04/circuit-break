import { getLevel, type Level } from '@/levels';
import {
  boardReducer,
  createInitialState,
  firstOnRow,
  getRemaining,
  hasTruthTable,
  type BoardAction,
  type BoardState,
} from '../boardReducer';

const notLevel = getLevel('w1-l1')!; // A ─► [s1] ─► Y, needs NOT
const andLevel = getLevel('w2-l1')!; // A, B ─► [s1] ─► Y, needs AND (truth table)

function play(level: Level, ...actions: BoardAction[]): BoardState {
  return actions.reduce(
    (state, action) => boardReducer(level, state, action),
    createInitialState(level),
  );
}

describe('boardReducer', () => {
  it('starts with an empty board', () => {
    const state = createInitialState(notLevel);
    expect(state.placement).toEqual({});
    expect(state.result).toBeNull();
  });

  it('selects a gate, and selecting it again unselects it', () => {
    expect(play(notLevel, { type: 'selectGate', gate: 'NOT' }).selectedGate).toBe('NOT');
    expect(
      play(notLevel, { type: 'selectGate', gate: 'NOT' }, { type: 'selectGate', gate: 'NOT' })
        .selectedGate,
    ).toBeNull();
  });

  it('places the selected gate when a slot is clicked', () => {
    const state = play(
      notLevel,
      { type: 'selectGate', gate: 'NOT' },
      { type: 'clickSlot', slotId: 's1' },
    );
    expect(state.placement).toEqual({ s1: 'NOT' });
    expect(state.selectedGate).toBeNull(); // the only NOT is used up
  });

  it('refuses a gate with the wrong number of inputs', () => {
    const state = play(andLevel, { type: 'placeGate', slotId: 's1', gate: 'NOT' });
    expect(state.placement).toEqual({});
    expect(state.message).toEqual({ key: 'wrongInputs', gate: 'NOT', count: 1 });
  });

  it('replaces a gate and gives the old one back to the toolbox', () => {
    const state = play(
      andLevel,
      { type: 'placeGate', slotId: 's1', gate: 'OR' },
      { type: 'placeGate', slotId: 's1', gate: 'AND' },
    );
    expect(state.placement).toEqual({ s1: 'AND' });
    expect(getRemaining(andLevel, state.placement, 'OR')).toBe(1);
    expect(getRemaining(andLevel, state.placement, 'AND')).toBe(0);
  });

  it('removes a gate when its slot is clicked with nothing selected', () => {
    const state = play(
      notLevel,
      { type: 'placeGate', slotId: 's1', gate: 'NOT' },
      { type: 'clickSlot', slotId: 's1' },
    );
    expect(state.placement).toEqual({});
  });

  it('undoes the last change', () => {
    const state = play(
      andLevel,
      { type: 'placeGate', slotId: 's1', gate: 'OR' },
      { type: 'placeGate', slotId: 's1', gate: 'AND' },
      { type: 'undo' },
    );
    expect(state.placement).toEqual({ s1: 'OR' });
  });

  it('warns about empty slots instead of testing', () => {
    const state = play(notLevel, { type: 'test' });
    expect(state.result).toBeNull();
    expect(state.message).toEqual({ key: 'emptySlots', count: 1 });
  });

  it('marks the level solved with the right gate', () => {
    const state = play(
      notLevel,
      { type: 'placeGate', slotId: 's1', gate: 'NOT' },
      { type: 'test' },
    );
    expect(state.result?.solved).toBe(true);
    expect(state.message).toEqual({ key: 'solved' });
    expect(state.attempts).toBe(1);
  });

  it('shows the first failing case when the circuit is wrong', () => {
    const state = play(andLevel, { type: 'placeGate', slotId: 's1', gate: 'OR' }, { type: 'test' });
    expect(state.result?.solved).toBe(false);
    expect(state.viewedCase).toBe(1); // A = 0, B = 1 is the first case OR gets wrong
    expect(state.message).toEqual({ key: 'notSolved' });
  });

  it('clears the test result when the board changes', () => {
    const state = play(
      andLevel,
      { type: 'placeGate', slotId: 's1', gate: 'OR' },
      { type: 'test' },
      { type: 'placeGate', slotId: 's1', gate: 'AND' },
    );
    expect(state.result).toBeNull();
  });

  it('resets the board but keeps the attempt count', () => {
    const state = play(
      notLevel,
      { type: 'placeGate', slotId: 's1', gate: 'NOT' },
      { type: 'test' },
      { type: 'reset' },
    );
    expect(state.placement).toEqual({});
    expect(state.attempts).toBe(1);
  });

  it('starts truth-table levels on a row where the bulb must be ON', () => {
    expect(firstOnRow(andLevel)).toBe(3); // A = 1, B = 1
    expect(createInitialState(andLevel).viewedCase).toBe(3);
    expect(createInitialState(notLevel).viewedCase).toBe(0);
  });

  it('flips a switch to show the matching row of the truth table', () => {
    // From A = 1, B = 1 (row 3), flipping A gives A = 0, B = 1 (row 1).
    expect(play(andLevel, { type: 'toggleSource', sourceId: 'A' }).viewedCase).toBe(1);
    expect(
      play(
        andLevel,
        { type: 'toggleSource', sourceId: 'A' },
        { type: 'toggleSource', sourceId: 'B' },
      ).viewedCase,
    ).toBe(0);
  });

  it('does not flip switches on levels without a truth table', () => {
    expect(hasTruthTable(notLevel)).toBe(false);
    expect(play(notLevel, { type: 'toggleSource', sourceId: 'A' }).viewedCase).toBe(0);
  });

  it('keeps the row being viewed when a gate is placed', () => {
    const state = play(
      andLevel,
      { type: 'toggleSource', sourceId: 'B' },
      { type: 'placeGate', slotId: 's1', gate: 'AND' },
    );
    expect(state.viewedCase).toBe(2); // A = 1, B = 0
  });

  it('can show any row before the first test', () => {
    expect(play(andLevel, { type: 'viewCase', index: 0 }).viewedCase).toBe(0);
    expect(play(andLevel, { type: 'viewCase', index: 9 }).viewedCase).toBe(3);
  });
});
