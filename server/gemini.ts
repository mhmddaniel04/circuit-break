import { ApiError, GoogleGenAI, ThinkingLevel, type ThinkingConfig } from '@google/genai';
import type { ChatPrompt } from '../src/features/chat/chatPrompt.js';
import type { ChatStreamer } from './chatRoute.js';
import type { HintGenerator } from './hintHandler.js';

/** Google's alias for its current Flash model. Override with the GEMINI_MODEL setting. */
export const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';

/**
 * Ways to switch "thinking" off or down, newest models first. Thinking makes answers start
 * seconds later, and short tutoring answers do not need it. Older models reject the newer
 * setting, so each option is tried in turn and the first one that works is remembered.
 */
export const FAST_THINKING: (ThinkingConfig | undefined)[] = [
  { thinkingLevel: ThinkingLevel.MINIMAL },
  { thinkingBudget: 0 },
  undefined,
];

let fastThinkingIndex = 0;

/** Runs a Gemini call with the fastest thinking setting this model accepts. */
export async function withFastThinking<T>(
  run: (thinkingConfig: ThinkingConfig | undefined) => Promise<T>,
): Promise<T> {
  for (let index = fastThinkingIndex; ; index += 1) {
    try {
      const result = await run(FAST_THINKING[index]);
      fastThinkingIndex = index;
      return result;
    } catch (error) {
      const settingRejected = error instanceof ApiError && error.status === 400;
      if (!settingRejected || index === FAST_THINKING.length - 1) throw error;
    }
  }
}

/** For tests. */
export function resetFastThinking(): void {
  fastThinkingIndex = 0;
}

export function createGeminiGenerator(apiKey: string, model = DEFAULT_GEMINI_MODEL): HintGenerator {
  const ai = new GoogleGenAI({ apiKey });

  return async ({ system, user }) => {
    const response = await ai.models.generateContent({
      model,
      contents: user,
      config: {
        systemInstruction: system,
        temperature: 0.5,
        // Room for the model's thinking as well as the short hint itself.
        maxOutputTokens: 2048,
      },
    });
    return response.text ?? '';
  };
}

/** Streams Bit's answer piece by piece, so the student sees it appear straight away. */
export function createGeminiChatStreamer(
  apiKey: string,
  model = DEFAULT_GEMINI_MODEL,
): ChatStreamer {
  const ai = new GoogleGenAI({ apiKey });

  return async function* ({ system, turns }: ChatPrompt) {
    const stream = await withFastThinking((thinkingConfig) =>
      ai.models.generateContentStream({
        model,
        contents: turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        config: {
          systemInstruction: system,
          temperature: 0.6,
          maxOutputTokens: 400,
          thinkingConfig,
        },
      }),
    );
    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  };
}
