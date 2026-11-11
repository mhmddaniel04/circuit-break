import { z } from 'zod';
import { GATE_ARITY, GATE_TYPES } from '@/features/simulation';

const localizedText = z.object({ en: z.string().min(1), ms: z.string().min(1) });
const gate = z.enum(GATE_TYPES);
const bit = z.union([z.literal(0), z.literal(1)]);

/** One piece of a lesson step. New block types can be added here later. */
const blockSchema = z.discriminatedUnion('type', [
  /** A paragraph. Blank lines in the text start a new paragraph. */
  z.object({ type: z.literal('text'), body: localizedText }),
  /** A highlighted "Remember" box. */
  z.object({ type: z.literal('tip'), body: localizedText }),
  /** A real-life example card with a big emoji icon. */
  z.object({
    type: z.literal('story'),
    icon: z.string().min(1).max(8),
    title: localizedText,
    body: localizedText,
  }),
  /** A "Did you know?" fun fact. */
  z.object({ type: z.literal('fact'), body: localizedText }),
  /** Bit the robot saying something in a speech bubble. */
  z.object({ type: z.literal('bit'), body: localizedText }),
  /** An interactive gate card with symbol, expression, truth table and switches. */
  z.object({ type: z.literal('gate'), gate }),
  /** A live circuit (switches → gate → bulb) with electricity flowing along the wires. */
  z.object({ type: z.literal('circuit'), gate }),
  /** "Predict first": guess the output for these inputs before the bulb shows it. */
  z
    .object({ type: z.literal('predict'), gate, inputs: z.array(bit).min(1).max(2) })
    .refine((block) => block.inputs.length === GATE_ARITY[block.gate], {
      message: 'predict needs one input value for each input of the gate',
    }),
  /** A truth table with the output column left blank for the student to fill in. */
  z.object({ type: z.literal('fillTable'), gate }),
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
