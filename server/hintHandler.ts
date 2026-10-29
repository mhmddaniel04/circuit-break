import { buildHintPrompt, type HintPrompt } from '../src/features/hints/hintPrompt.js';
import { hintRequestSchema, type HintResponse } from '../src/features/hints/hintSchema.js';

/** Anything that turns a prompt into text: Gemini in production, a fake in tests. */
export type HintGenerator = (prompt: HintPrompt) => Promise<string>;

export interface HandlerResult {
  status: number;
  body: HintResponse;
}

const MAX_HINT_LENGTH = 400;

/** Removes markdown symbols and extra spaces, and keeps the hint short. */
export function cleanHint(text: string): string {
  const plain = text
    .replace(/[*_#`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > MAX_HINT_LENGTH ? `${plain.slice(0, MAX_HINT_LENGTH - 1)}…` : plain;
}

export async function handleHintRequest(
  body: unknown,
  generate: HintGenerator,
): Promise<HandlerResult> {
  const parsed = hintRequestSchema.safeParse(body);
  if (!parsed.success) return { status: 400, body: { error: 'invalid_request' } };

  try {
    const hint = cleanHint(await generate(buildHintPrompt(parsed.data)));
    if (!hint) return { status: 502, body: { error: 'empty_hint' } };
    return { status: 200, body: { hint } };
  } catch {
    return { status: 502, body: { error: 'ai_unavailable' } };
  }
}