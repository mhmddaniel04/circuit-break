import type { HintRequest } from '../../src/features/hints/hintSchema.js';

/** A valid /api/hint body: level "Double Lock" with OR placed instead of AND. */
export const sampleHintRequest: HintRequest = {
  lang: 'en',
  hintLevel: 1,
  level: {
    title: 'Double Lock',
    concept: 'AND gives 1 only when ALL of its inputs are 1.',
    grid: { cols: 5, rows: 4 },
  },
  sources: ['A', 'B'],
  slots: [
    { id: 's1', pos: [2, 1], inputs: ['A', 'B'], placed: 'OR', correct: 'AND', locked: false },
  ],
  bulbs: [{ id: 'Y', from: 's1' }],
  toolbox: [
    { gate: 'AND', count: 1 },
    { gate: 'OR', count: 1 },
  ],
  totalCases: 4,
  failingCases: [{ inputs: { A: 0, B: 1 }, wrong: [{ bulb: 'Y', expected: 0, actual: 1 }] }],
};