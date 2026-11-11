import type { ChatRequest } from './chatSchema';

/** Why a question could not be answered. Each one has its own message for the student. */
export type ChatError = 'offline' | 'rate_limited' | 'unavailable';

export class ChatRequestError extends Error {
  constructor(public readonly reason: ChatError) {
    super(reason);
  }
}

/**
 * Sends a question to Bit. `onText` is called with the whole answer so far each time a new
 * piece arrives. Resolves with the full answer.
 */
export async function streamChat(
  request: ChatRequest,
  onText: (answerSoFar: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ChatRequestError('offline');
  }

  if (!response.ok || !response.body) {
    throw new ChatRequestError(response.status === 429 ? 'rate_limited' : 'unavailable');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let answer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    answer += decoder.decode(value, { stream: true });
    onText(answer);
  }
  answer += decoder.decode();
  return answer;
}

/** Removes markdown symbols the AI sometimes adds anyway, and turns "* item" into "• item". */
export function cleanChatText(text: string): string {
  return text
    .replace(/^\s*[*-]\s+/gm, '• ')
    .replace(/^#+\s*/gm, '')
    .replace(/\*\*|__|`/g, '');
}
