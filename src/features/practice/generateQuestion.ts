import { GATE_ARITY, type GateType } from '@/features/simulation';
import { solveQuestion, type PracticeQuestion, type QuestionColumn } from './question';

export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

/** A random number from 0 (inclusive) to 1 (exclusive). */
export type Random = () => number;

const SETTINGS: Record<Difficulty, { inputs: string[]; gates: number[]; pool: GateType[] }> = {
  easy: { inputs: ['A', 'B'], gates: [2], pool: ['NOT', 'AND', 'OR'] },
  medium: { inputs: ['A', 'B', 'C'], gates: [2, 3], pool: ['NOT', 'AND', 'OR'] },
  hard: { inputs: ['A', 'B', 'C'], gates: [3], pool: ['NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR'] },
};

const MIDDLE_NAMES = ['P', 'Q', 'R'];

/** A small seeded random generator (mulberry32), so the same seed always gives the same question. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(items: readonly T[], random: Random): T =>
  items[Math.floor(random() * items.length)];

/**
 * Makes a new random circuit question. Every input and every middle column is used once, no column
 * is always 0 or always 1, and no gate repeats another one.
 */
export function generateQuestion(difficulty: Difficulty, random: Random): PracticeQuestion {
  const settings = SETTINGS[difficulty];
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const question = tryBuild(settings.inputs, pick(settings.gates, random), settings.pool, random);
    if (question) return question;
  }
  throw new Error(`Could not make a ${difficulty} question`);
}

function tryBuild(
  inputs: string[],
  gateCount: number,
  pool: GateType[],
  random: Random,
): PracticeQuestion | null {
  const columns: QuestionColumn[] = [];
  const signals = [...inputs];
  const unused = [...inputs];

  for (let k = 0; k < gateCount; k += 1) {
    const isLast = k === gateCount - 1;
    const gate = pick(pool, random);
    const arity = GATE_ARITY[gate];
    // The last gate must use everything that is still unused.
    if (isLast && unused.length > arity) return null;
    if (!isLast && unused.length > arity + (gateCount - 1 - k) * 2) return null;

    // Prefer signals nobody has used yet (the last gate must take all of them), then any other.
    const from: string[] = [];
    const fresh = [...unused];
    while (from.length < arity && fresh.length > 0) {
      const index = isLast ? 0 : Math.floor(random() * fresh.length);
      from.push(fresh.splice(index, 1)[0]);
    }
    const others = signals.filter((signal) => !from.includes(signal));
    while (from.length < arity && others.length > 0) {
      from.push(others.splice(Math.floor(random() * others.length), 1)[0]);
    }
    if (from.length < arity) return null;
    // Keep the textbook order: the part with A comes before the part with B, and so on.
    const firstInput = (name: string) =>
      Math.min(...[...inputsOf(name, columns)].map((input) => inputs.indexOf(input)));
    from.sort((a, b) => firstInput(a) - firstInput(b));
    // Each input feeds the circuit only once, so expressions like A · B · B never appear.
    if (from.length === 2 && sharesInput(from[0], from[1], columns)) return null;

    // No NOT straight after NOT, NAND or NOR (that would just undo it), and no repeated gates.
    const source = columns.find((column) => column.name === from[0]);
    if (gate === 'NOT' && source && ['NOT', 'NAND', 'NOR'].includes(source.gate)) return null;
    const key = (c: QuestionColumn) => `${c.gate}:${[...c.from].sort().join(',')}`;
    const column = { name: isLast ? 'Y' : MIDDLE_NAMES[k], gate, from };
    if (columns.some((c) => key(c) === key(column))) return null;

    columns.push(column);
    for (const name of from) unused.splice(unused.indexOf(name), 1);
    signals.push(column.name);
    unused.push(column.name);
  }

  const question = { inputs, columns };
  if (unused.length !== 1) return null;

  // Every column must change at least once, otherwise the question is too easy.
  const rows = solveQuestion(question);
  const changes = columns.every((_, i) => new Set(rows.map((row) => row.outputs[i])).size === 2);
  return changes ? question : null;
}

/** The inputs (A, B, C) that a signal depends on. */
function inputsOf(name: string, columns: QuestionColumn[]): Set<string> {
  const column = columns.find((c) => c.name === name);
  if (!column) return new Set([name]);
  return new Set(column.from.flatMap((from) => [...inputsOf(from, columns)]));
}

function sharesInput(a: string, b: string, columns: QuestionColumn[]): boolean {
  const first = inputsOf(a, columns);
  return [...inputsOf(b, columns)].some((input) => first.has(input));
}
