import { z } from 'zod';
import { GATE_TYPES } from '@/features/simulation';

const localizedText = z.object({ en: z.string().min(1), ms: z.string().min(1) });

/** One piece of a lesson step. New block types can be added here later. */
const blockSchema = z.discriminatedUnion('type', [
  /** A paragraph. Blank lines in the text start a new paragraph. */
  z.object({ type: z.literal('text'), body: localizedText }),
  /** A highlighted "Remember" box. */
  z.object({ type: z.literal('tip'), body: localizedText }),
  /** An interactive gate card with symbol, expression, truth table and switches. */
  z.object({ type: z.literal('gate'), gate: z.enum(GATE_TYPES) }),
]);

const stepSchema = z.object({
  title: localizedText,
  blocks: z.array(blockSchema).min(1),
});

const questionSchema = z
  .object({
    question: localizedText,
    options: z.array(localizedText).min(2).max(4),
    /** Index of the correct option (0 = first). */
    answer: z.number().int().min(0),
    /** Shown after the student answers, right or wrong. */
    explain: localizedText,
  })
  .refine((question) => question.answer < question.options.length, {
    message: 'answer must point to one of the options',
  });

/** The shape of one file in src/lessons/data/: the lesson for one world. */
export const lessonSchema = z.object({
  world: z.number().int().min(1),
  steps: z.array(stepSchema).min(1),
  quiz: z.array(questionSchema).min(3),
});

export type Lesson = z.infer<typeof lessonSchema>;
export type LessonBlock = z.infer<typeof blockSchema>;
export type LessonStep = z.infer<typeof stepSchema>;
export type QuizQuestion = z.infer<typeof questionSchema>;
