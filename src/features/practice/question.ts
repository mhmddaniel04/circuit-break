import { applyGate, type Bit, type GateType } from '@/features/simulation';

/** One gate of a practice circuit. Its output is a new column in the truth table (P, Q, R or Y). */
export interface QuestionColumn {
  name: string;
  gate: GateType;
  /** Input names (A, B, C) or earlier column names. */
  from: string[];
}

/** An SPM-style question: a small circuit and its truth table with middle columns. */
export interface PracticeQuestion {
  inputs: string[];
  /** In order; the last one is always the output Y. */
  columns: QuestionColumn[];
}

export interface TruthRow {
  inputs: Bit[];
  /** One value per column, in the same order as `columns`. */
  outputs: Bit[];
}

/** Every combination of inputs in SPM order (000, 001, 010 …), with every column's value. */
export function solveQuestion(question: PracticeQuestion): TruthRow[] {
  const count = question.inputs.length;
  return Array.from({ length: 2 ** count }, (_, row) => {
    const values = new Map<string, Bit>();
    const inputs = question.inputs.map((name, i) => {
      const bit = ((row >> (count - 1 - i)) & 1) as Bit;
      values.set(name, bit);
      return bit;
    });
    const outputs = question.columns.map((column) => {
      const value = applyGate(
        column.gate,
        column.from.map((name) => values.get(name)!),
      );
      values.set(column.name, value);
      return value;
    });
    return { inputs, outputs };
  });
}

// ---------- Boolean expressions ----------

/** A piece of an expression: plain text, or a group with a bar on top (NOT). */
export type ExprToken = string | { over: ExprToken[] };

const SYMBOL: Partial<Record<GateType, string>> = {
  AND: ' · ',
  OR: ' + ',
  XOR: ' ⊕ ',
  NAND: ' · ',
  NOR: ' + ',
};

/** How tightly each operator binds, so brackets are added only where they are needed. */
const PRECEDENCE: Partial<Record<GateType, number>> = { XOR: 1, OR: 1, AND: 2 };

interface Built {
  tokens: ExprToken[];
  /** The operator at the top, or null for a single letter or a barred group (no brackets needed). */
  top: GateType | null;
}

function build(name: string, question: PracticeQuestion): Built {
  const column = question.columns.find((c) => c.name === name);
  if (!column) return { tokens: [name], top: null };

  const operands = column.from.map((from) => build(from, question));
  if (column.gate === 'NOT') return { tokens: [{ over: operands[0].tokens }], top: null };

  const joined = joinOperands(column.gate, operands);
  // NAND and NOR are written as a bar over the whole AND / OR.
  if (column.gate === 'NAND' || column.gate === 'NOR')
    return { tokens: [{ over: joined }], top: null };
  return { tokens: joined, top: column.gate };
}

function joinOperands(gate: GateType, operands: Built[]): ExprToken[] {
  const own = gate === 'NAND' ? 'AND' : gate === 'NOR' ? 'OR' : gate;
  const tokens: ExprToken[] = [];
  operands.forEach((operand, index) => {
    if (index > 0) tokens.push(SYMBOL[gate]!);
    // Brackets around a weaker operator (A + B inside an AND), and around anything inside XOR.
    const needsBrackets =
      operand.top !== null &&
      (own === 'XOR' ||
        (operand.top !== own && (PRECEDENCE[operand.top] ?? 0) <= (PRECEDENCE[own] ?? 0)));
    tokens.push(...(needsBrackets ? ['(', ...operand.tokens, ')'] : operand.tokens));
  });
  return tokens;
}

/** The output Y written as one Boolean expression of the inputs, e.g. Y = (A + B) · C̄. */
export function outputExpression(question: PracticeQuestion): ExprToken[] {
  const last = question.columns[question.columns.length - 1];
  return build(last.name, question).tokens;
}

/** One column written with its direct inputs, e.g. Q = P · C (used in the worked answer). */
export function columnExpression(column: QuestionColumn): ExprToken[] {
  const single: PracticeQuestion = { inputs: [], columns: [column] };
  return build(column.name, single).tokens;
}

/** The expression as words, for screen readers: a bar is read as "NOT ( … )". */
export function expressionToSpeech(tokens: ExprToken[]): string {
  return tokens
    .map((token) => (typeof token === 'string' ? token : `NOT (${expressionToSpeech(token.over)})`))
    .join('')
    .replace(/ · /g, ' AND ')
    .replace(/ \+ /g, ' OR ')
    .replace(/ ⊕ /g, ' XOR ');
}
