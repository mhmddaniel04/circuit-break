import { ApiError, GoogleGenAI, ThinkingLevel, type ThinkingConfig } from '@google/genai';
import type { ChatPrompt } from '../src/features/chat/chatPrompt.js';
import type { ChatStreamer } from './chatRoute.js';
import type { HintGenerator } from './hintHandler.js';

/**
 * Google's alias for its current Flash-Lite model: the fastest to start answering, and plenty
 * for short tutoring answers. Override with the GEMINI_MODEL setting.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-flash-lite-latest';
/** Used instead if the API key cannot use Flash-Lite. */
export const FALLBACK_GEMINI_MODEL = 'gemini-flash-latest';

let defaultModelMissing = false;

/**
 * Runs a Gemini call with the chosen model. If the default model is not available (404), it
 * switches to the fallback model and remembers that. A model set with GEMINI_MODEL is used as is.
 */
export async function withModelFallback<T>(
  model: string,
  run: (model: string) => Promise<T>,
): Promise<T> {
  if (model !== DEFAULT_GEMINI_MODEL) return run(model);
  if (defaultModelMissing) return run(FALLBACK_GEMINI_MODEL);
  try {
    return await run(model);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
    defaultModelMissing = true;
    return run(FALLBACK_GEMINI_MODEL);
  }
}

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
  defaultModelMissing = false;
}

/** Stop waiting for Gemini after this long. The browser then shows the game's own hint. */
export const HINT_TIMEOUT_MS = 9_000;
export const CHAT_TIMEOUT_MS = 20_000;

export function createGeminiGenerator(apiKey: string, model = DEFAULT_GEMINI_MODEL): HintGenerator {
  const ai = new GoogleGenAI({ apiKey });

  return async ({ system, user }) => {
    const response = await withModelFallback(model, (chosen) =>
      withFastThinking((thinkingConfig) =>
        ai.models.generateContent({
          model: chosen,
          contents: user,
          config: {
            systemInstruction: system,
            temperature: 0.5,
            maxOutputTokens: 300,
            thinkingConfig,
            abortSignal: AbortSignal.timeout(HINT_TIMEOUT_MS),
          },
        }),
      ),
    );
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
    const stream = await withModelFallback(model, (chosen) =>
      withFastThinking((thinkingConfig) =>
        ai.models.generateContentStream({
          model: chosen,
          contents: turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
          config: {
            systemInstruction: system,
            temperature: 0.6,
            maxOutputTokens: 350,
            thinkingConfig,
            abortSignal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
          },
        }),
      ),
    );
    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  };
}
