import i18n from '@/i18n';
import { getLevel } from '@/levels';
import { planHint, smartHintText } from '../smartHints';

const t = i18n.getFixedT('en');
const andLevel = getLevel('w2-l1')!; // A, B ─► [s1] ─► Y, needs AND
const tripleCheck = getLevel('w2-l3')!; // A, B ─► [s1]; s1, C ─► [s2] ─► Y, needs AND + AND

describe('planHint', () => {
  it('points at an empty slot with the row that says most about the gate', () => {
    // AND gives 1 only for 1 and 1, so that is the row to show.
    expect(planHint(andLevel, {})).toEqual({
      kind: 'empty',
      slotId: 's1',
      correct: 'AND',
      inputs: [1, 1],
      needs: 1,
    });
  });

  it('shows a row where the wrong gate gives the wrong output', () => {
    expect(planHint(andLevel, { s1: 'OR' })).toEqual({
      kind: 'wrong',
      slotId: 's1',
      correct: 'AND',
      placed: 'OR',
      inputs: [0, 1],
      gives: 1,
      needs: 0,
    });
  });

  it('looks at the slot nearest the inputs first', () => {
    const plan = planHint(tripleCheck, { s1: 'OR', s2: 'OR' });
    expect(plan).toMatchObject({ kind: 'wrong', slotId: 's1', correct: 'AND' });
  });

  it('skips slots that are already right', () => {
    const plan = planHint(tripleCheck, { s1: 'AND', s2: 'OR' });
    expect(plan).toMatchObject({ kind: 'wrong', slotId: 's2', placed: 'OR' });
  });

  it('says so when the circuit already works', () => {
    expect(planHint(andLevel, { s1: 'AND' })).toEqual({ kind: 'solved' });
  });
});

describe('smartHintText', () => {
  it('explains what the glowing slot must do', () => {
    expect(smartHintText(planHint(andLevel, {}), 2, t)).toBe(
      'Look at the glowing slot. When it gets 1 and 1, it must give 1. Which gate does that?',
    );
    expect(smartHintText(planHint(andLevel, { s1: 'OR' }), 2, t)).toMatch(
      /the OR in the glowing slot is the problem: when it gets 0 and 1, it gives 1/i,
    );
  });

  it('names the gate on the last hint', () => {
    expect(smartHintText(planHint(andLevel, {}), 3, t)).toMatch(
      /^Put the AND gate in the glowing slot/,
    );
  });
});
