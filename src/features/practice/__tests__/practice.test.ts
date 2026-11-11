import { crossesGate, layoutQuestion } from '../components/diagramLayout';
import { createRandom, DIFFICULTIES, generateQuestion } from '../generateQuestion';
import {
  columnExpression,
  expressionToSpeech,
  outputExpression,
  solveQuestion,
  type PracticeQuestion,
} from '../question';

/** Y = (A + B) · C̄, with P = A + B and Q = NOT C. */
const sample: PracticeQuestion = {
  inputs: ['A', 'B', 'C'],
  columns: [
    { name: 'P', gate: 'OR', from: ['A', 'B'] },
    { name: 'Q', gate: 'NOT', from: ['C'] },
    { name: 'Y', gate: 'AND', from: ['P', 'Q'] },
  ],
};

const speech = (question: PracticeQuestion) => expressionToSpeech(outputExpression(question));

describe('solveQuestion', () => {
  it('lists every input combination in SPM order with the middle columns', () => {
    const rows = solveQuestion(sample);
    expect(rows).toHaveLength(8);
    expect(rows[0]).toEqual({ inputs: [0, 0, 0], outputs: [0, 1, 0] });
    expect(rows[2]).toEqual({ inputs: [0, 1, 0], outputs: [1, 1, 1] });
    expect(rows[7]).toEqual({ inputs: [1, 1, 1], outputs: [1, 0, 0] });
  });
});

describe('Boolean expressions', () => {
  it('adds brackets only where they are needed', () => {
    expect(speech(sample)).toBe('(A OR B) AND NOT (C)');
    const andThenOr: PracticeQuestion = {
      inputs: ['A', 'B', 'C'],
      columns: [
        { name: 'P', gate: 'AND', from: ['A', 'B'] },
        { name: 'Y', gate: 'OR', from: ['P', 'C'] },
      ],
    };
    expect(speech(andThenOr)).toBe('A AND B OR C');
  });

  it('writes NAND and NOR as a bar over the whole AND or OR', () => {
    const nand: PracticeQuestion = {
      inputs: ['A', 'B', 'C'],
      columns: [
        { name: 'P', gate: 'OR', from: ['A', 'B'] },
        { name: 'Y', gate: 'NAND', from: ['P', 'C'] },
      ],
    };
    expect(outputExpression(nand)).toEqual([{ over: ['(', 'A', ' + ', 'B', ')', ' · ', 'C'] }]);
  });

  it('always puts brackets around a group inside XOR', () => {
    const xor: PracticeQuestion = {
      inputs: ['A', 'B', 'C'],
      columns: [
        { name: 'P', gate: 'AND', from: ['A', 'B'] },
        { name: 'Y', gate: 'XOR', from: ['P', 'C'] },
      ],
    };
    expect(speech(xor)).toBe('(A AND B) XOR C');
  });

  it('writes one column with its direct inputs for the worked answer', () => {
    expect(columnExpression(sample.columns[2])).toEqual(['P', ' · ', 'Q']);
  });
});

describe('generateQuestion', () => {
  const questions = DIFFICULTIES.flatMap((difficulty) =>
    Array.from({ length: 150 }, (_, seed) => ({
      difficulty,
      question: generateQuestion(difficulty, createRandom(seed)),
    })),
  );

  it('gives the same question for the same seed', () => {
    expect(generateQuestion('hard', createRandom(42))).toEqual(
      generateQuestion('hard', createRandom(42)),
    );
  });

  it('uses 2 inputs for easy questions and 3 for medium and hard', () => {
    for (const { difficulty, question } of questions) {
      expect(question.inputs).toHaveLength(difficulty === 'easy' ? 2 : 3);
    }
  });

  it('ends with Y, and uses every input and every middle column', () => {
    for (const { question } of questions) {
      expect(question.columns.at(-1)?.name).toBe('Y');
      const used = new Set(question.columns.flatMap((column) => column.from));
      for (const name of [
        ...question.inputs,
        ...question.columns.slice(0, -1).map((c) => c.name),
      ]) {
        expect(used.has(name)).toBe(true);
      }
    }
  });

  it('uses each input only once, so there are no repeats like A · B · B', () => {
    for (const { question } of questions) {
      const letters = expressionToSpeech(outputExpression(question)).match(/\b[ABC]\b/g) ?? [];
      expect(new Set(letters).size).toBe(letters.length);
    }
  });

  it('never makes a column that is always 0 or always 1', () => {
    for (const { question } of questions) {
      const rows = solveQuestion(question);
      question.columns.forEach((_, i) => {
        expect(new Set(rows.map((row) => row.outputs[i])).size).toBe(2);
      });
    }
  });

  it('only uses NAND, NOR and XOR in hard questions', () => {
    for (const { difficulty, question } of questions) {
      if (difficulty === 'hard') continue;
      for (const column of question.columns) expect(['NOT', 'AND', 'OR']).toContain(column.gate);
    }
  });

  it('draws every diagram without wires running through gates', () => {
    for (const { question } of questions) {
      const layout = layoutQuestion(question);
      for (const wire of layout.wires) {
        // Walk the path "M x y H x V y H x …" and check every horizontal part.
        const parts = wire.d.split(' ');
        let x = Number(parts[1]);
        let y = Number(parts[2]);
        const target = Number(parts[parts.length - 1]);
        const others = layout.gates.filter((gate) => Math.abs(gate.x - 36 - target) > 1);
        for (let i = 3; i < parts.length; i += 2) {
          const value = Number(parts[i + 1]);
          if (parts[i] === 'H') {
            expect(crossesGate(y, Math.min(x, value) + 1, Math.max(x, value) - 1, others)).toBe(
              false,
            );
            x = value;
          } else {
            y = value;
          }
        }
      }
    }
  });
});
