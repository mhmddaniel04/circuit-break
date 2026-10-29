import { getLevel } from '@/levels';
import { buildHintRequest } from '../hintRequest';
import { hintRequestSchema } from '../hintSchema';

describe('buildHintRequest', () => {
  it('describes the wrong cases and the correct gate for each slot', () => {
    const request = buildHintRequest(getLevel('w2-l1')!, { s1: 'OR' }, 1, 'en');
    expect(request.slots).toEqual([
      { id: 's1', pos: [2, 1], inputs: ['A', 'B'], placed: 'OR', correct: 'AND', locked: false },
    ]);
    expect(request.totalCases).toBe(4);
    expect(request.failingCases).toEqual([
      { inputs: { A: 0, B: 1 }, wrong: [{ bulb: 'Y', expected: 0, actual: 1 }] },
      { inputs: { A: 1, B: 0 }, wrong: [{ bulb: 'Y', expected: 0, actual: 1 }] },
    ]);
  });

  it('marks empty slots and locked gates', () => {
    const request = buildHintRequest(getLevel('w4-l2')!, {}, 2, 'ms');
    expect(request.slots[0]).toMatchObject({ placed: 'NOT', correct: 'NOT', locked: true });
    expect(request.slots[1]).toMatchObject({ placed: null, correct: 'OR', locked: false });
    expect(request.lang).toBe('ms');
    expect(request.level.title).toBe('Terkunci');
  });

  it('picks the solution closest to the board when a level has two answers', () => {
    // Majority vote: (AND, OR, AND, OR) and (OR, AND, OR, AND) both work.
    const request = buildHintRequest(getLevel('w4-l7')!, { s1: 'OR' }, 1, 'en');
    expect(request.slots.map((slot) => slot.correct)).toEqual(['OR', 'AND', 'OR', 'AND']);
  });

  it('always produces data the server accepts', () => {
    const request = buildHintRequest(getLevel('w4-l6')!, {}, 3, 'en');
    expect(hintRequestSchema.safeParse(request).success).toBe(true);
  });
});