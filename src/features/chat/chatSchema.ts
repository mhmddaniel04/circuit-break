// Shared by the browser and the server (api/chat.ts), so this file must only use relative imports.
import { z } from 'zod';

/** The longest question a student can type. */
export const MAX_QUESTION_LENGTH = 300;
/** How many recent messages are sent with each question, so Bit remembers the conversation. */
export const MAX_HISTORY = 10;
/** The longest reference note sent with a question. */
export const MAX_REFERENCE_LENGTH = 600;

const message = z.object({
  role: z.enum(['user', 'bit']),
  text: z.string().trim().min(1).max(1200),
});

/** A message on screen. `source: 'faq'` marks an instant answer from Bit's answer bank. */
export type ChatMessage = z.infer<typeof message> & { source?: 'faq' | 'ai' };

/** One question for Bit, with the conversation so far. */
export const chatRequestSchema = z
  .object({
    lang: z.enum(['en', 'ms']),
    /** The lesson the student is reading, or null on the gate reference page. */
    world: z.number().int().min(1).max(5).nullable(),
    messages: z.array(message).min(1).max(MAX_HISTORY),
    /** Notes from Bit's answer bank that are close to the question, so the AI answers faster. */
    reference: z.array(z.string().max(MAX_REFERENCE_LENGTH)).max(2).optional(),
  })
  .refine(
    ({ messages }) => {
      const last = messages[messages.length - 1];
      return last.role === 'user' && last.text.length <= MAX_QUESTION_LENGTH;
    },
    { message: 'The last message must be a question from the student' },
  );

export type ChatRequest = z.infer<typeof chatRequestSchema>;
