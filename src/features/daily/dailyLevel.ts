import {
  createRandom,
  expressionToSpeech,
  generateQuestion,
  outputExpression,
  solveQuestion,
  type PracticeQuestion,
} from '@/features/practice';
import type { GateType } from '@/features/simulation';
import type { Level } from '@/levels';

/** Today's local date as "YYYY-MM-DD": the daily challenge changes at midnight. */
export function todayKey(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Turns a date into a number (FNV-1a hash), so every player gets the same puzzle that day. */
function seedFromDate(date: string): number {
  let hash = 0x811c9dc5;
  for (const char of date) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The daily challenge for one date: a random 3-input circuit with 2 or 3 gates. */
export function buildDailyLevel(date: string): Level {
  const question = generateQuestion('medium', createRandom(seedFromDate(date)));
  return questionToLevel(question, date);
}

/** Lays a practice question out on the game board: inputs on the left, the bulb on the right. */
export function questionToLevel(question: PracticeQuestion, date: string): Level {
  // The output gate is called Y in the practice question, but Y is the bulb here.
  const slotId = (name: string) => (name === 'Y' ? 'OUT' : name);
  const rows = Math.max(question.inputs.length, 3);
  const position = new Map<string, [number, number]>();
  const depth = new Map<string, number>();

  question.inputs.forEach((name, i) => {
    const row =
      question.inputs.length === rows
        ? i
        : Math.round((i * (rows - 1)) / (question.inputs.length - 1));
    position.set(name, [0, row]);
    depth.set(name, 0);
  });

  // Each gate goes one step right of its deepest input.
  for (const column of question.columns) {
    depth.set(column.name, 1 + Math.max(...column.from.map((from) => depth.get(from)!)));
  }
  const colOf = (name: string) => Math.max(0, depth.get(name)! * 2 - 1);
  /** The columns where a signal is used. */
  const usedIn = (name: string) =>
    question.columns.filter((c) => c.from.includes(name)).map((c) => colOf(c.name));

  // A gate goes at the average row of its inputs, but never on a row where another wire has
  // to pass straight through this column to reach a gate further right.
  const taken = new Set<string>();
  for (const column of question.columns) {
    const col = colOf(column.name);
    const passing = new Set(
      [...position]
        .filter(([name, [c]]) => c < col && usedIn(name).some((use) => use > col))
        .map(([, [, row]]) => row),
    );
    const wanted = Math.round(
      column.from.reduce((sum, from) => sum + position.get(from)![1], 0) / column.from.length,
    );
    const candidates = [0, 1, -1, 2, -2]
      .map((step) => wanted + step)
      .filter((r) => r >= 0 && r < rows && !taken.has(`${col},${r}`));
    const row = candidates.find((r) => !passing.has(r)) ?? candidates[0];
    taken.add(`${col},${row}`);
    position.set(column.name, [col, row]);
  }

  const output = question.columns[question.columns.length - 1];
  const [outputCol, outputRow] = position.get(output.name)!;
  const bulbCol = outputCol + 2;
  const truth = solveQuestion(question);

  const gateCounts = new Map<GateType, number>();
  for (const column of question.columns) {
    gateCounts.set(column.gate, (gateCounts.get(column.gate) ?? 0) + 1);
  }
  const expression = expressionToSpeech(outputExpression(question));

  return {
    id: `daily-${date}`,
    world: 0,
    order: 1,
    title: { en: 'Daily Challenge', ms: 'Cabaran Harian' },
    concept: { en: `Build Y = ${expression}`, ms: `Bina Y = ${expression}` },
    hint: {
      en: 'Start with the gate closest to the inputs, then work towards the bulb.',
      ms: 'Mulakan dengan get yang paling dekat dengan input, kemudian bergerak ke arah mentol.',
    },
    objective: 2,
    grid: { cols: bulbCol + 1, rows },
    sources: question.inputs.map((name, i) => ({
      id: name,
      pos: position.get(name)!,
      value: truth[0].inputs[i],
    })),
    bulbs: [{ id: 'Y', pos: [bulbCol, outputRow], target: truth[0].outputs.at(-1)! }],
    slots: question.columns.map((column) => ({
      id: slotId(column.name),
      pos: position.get(column.name)!,
    })),
    wires: [
      ...question.columns.flatMap((column) =>
        column.from.map((from, port) => ({ from: slotId(from), to: slotId(column.name), port })),
      ),
      { from: slotId(output.name), to: 'Y' },
    ],
    cases: truth.map((row) => ({
      inputs: Object.fromEntries(question.inputs.map((name, i) => [name, row.inputs[i]])),
      targets: { Y: row.outputs.at(-1)! },
    })),
    toolbox: [...gateCounts].map(([gate, count]) => ({ gate, count })),
    par: { gates: question.columns.length, seconds: 60 + 20 * question.columns.length },
  };
}
