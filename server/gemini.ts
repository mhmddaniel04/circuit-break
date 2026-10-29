import { GoogleGenAI } from '@google/genai';
import type { HintGenerator } from './hintHandler.js';

/** Google's alias for its current Flash model. Override with the GEMINI_MODEL setting. */
export const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';

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