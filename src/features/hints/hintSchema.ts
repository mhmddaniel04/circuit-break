// Shared by the browser and the server (api/hint.ts), so this file must only use relative imports.
import { z } from 'zod';

export const HINT_GATES = ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'] as const;
export const MAX_HINTS = 3;

const nodeId = z.string().regex(/^[A-Za-z0-9]{1,4}$/);
const bit = z.union([z.literal(0), z.literal(1)]);
const gate = z.enum(HINT_GATES);

/** Everything the AI needs to know about the student's circuit. Kept small and strictly validated. */
export const hintRequestSchema = z.object({
  lang: z.enum(['en', 'ms']),
  hintLevel: z.number().int().min(1).max(MAX_HINTS),
  level: z.object({
    title: z.string().min(1).max(80),
    concept: z.string().min(1).max(300),
    grid: z.object({
      cols: z.number().int().min(1).max(20),
      rows: z.number().int().min(1).max(20),
    }),
  }),
  sources: z.array(nodeId).min(1).max(6),
  slots: z
    .array(
      z.object({
        id: nodeId,
        pos: z.tuple([z.number().int().min(0).max(20), z.number().int().min(0).max(20)]),
        inputs: z.array(nodeId).max(2),
        placed: gate.nullable(),
        correct: gate,
        locked: z.boolean(),
      }),
    )
    .max(12),
  bulbs: z
    .array(z.object({ id: nodeId, from: nodeId }))
    .min(1)
    .max(4),
  toolbox: z.array(z.object({ gate, count: z.number().int().min(1).max(9) })).max(6),
  totalCases: z.number().int().min(1).max(64),
  failingCases: z
    .array(
      z.object({
        inputs: z.record(z.string(), bit),
        wrong: z.array(z.object({ bulb: nodeId, expected: bit, actual: z.union([bit, z.null()]) })),
      }),
    )
    .max(16),
});

export type HintRequest = z.infer<typeof hintRequestSchema>;

export interface HintResponse {
  hint?: string;
  error?: string;
}
