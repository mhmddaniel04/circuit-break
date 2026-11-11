import { buildChatPrompt, type ChatPrompt } from '../src/features/chat/chatPrompt.js';
import { chatRequestSchema } from '../src/features/chat/chatSchema.js';
import { createGeminiChatStreamer } from './gemini.js';
import { createRateLimiter } from './rateLimit.js';

/** Turns a prompt into text, piece by piece: Gemini in production, a fake in tests. */
export type ChatStreamer = (prompt: ChatPrompt) => AsyncIterable<string>;

export interface ChatEnv {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

export interface ChatRouteDeps {
  createStreamer: (apiKey: string, model?: string) => ChatStreamer;
  isRateLimited: (visitor: string) => boolean;
}

const defaultDeps: ChatRouteDeps = {
  createStreamer: createGeminiChatStreamer,
  // 10 questions per minute per visitor: enough to learn, and keeps the free API quota safe.
  isRateLimited: createRateLimiter(10, 60_000),
};

/** Stops an answer that runs on far longer than the prompt asks for. */
const MAX_ANSWER_LENGTH = 1500;

const json = (body: unknown, status: number) => Response.json(body, { status });

/** POST /api/chat. Answers with plain text that arrives in pieces (a stream). */
export async function handleChatHttp(
  request: Request,
  env: ChatEnv,
  deps: ChatRouteDeps = defaultDeps,
): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (!env.GEMINI_API_KEY) return json({ error: 'not_configured' }, 503);

  const visitor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (deps.isRateLimited(visitor)) return json({ error: 'rate_limited' }, 429);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return json({ error: 'invalid_request' }, 400);

  // Wait for the first piece, so a failing AI service still gets a proper error status.
  const streamer = deps.createStreamer(env.GEMINI_API_KEY, env.GEMINI_MODEL || undefined);
  let pieces: AsyncIterator<string>;
  let first: IteratorResult<string>;
  try {
    pieces = streamer(buildChatPrompt(parsed.data))[Symbol.asyncIterator]();
    first = await pieces.next();
  } catch {
    return json({ error: 'ai_unavailable' }, 502);
  }
  if (first.done) return json({ error: 'empty_answer' }, 502);

  const encoder = new TextEncoder();
  let length = first.value.length;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(first.value));
    },
    async pull(controller) {
      try {
        const next = await pieces.next();
        if (next.done || length > MAX_ANSWER_LENGTH) {
          controller.close();
          return;
        }
        length += next.value.length;
        controller.enqueue(encoder.encode(next.value));
      } catch {
        // The answer so far is still useful, so end it quietly instead of failing.
        controller.close();
      }
    },
    async cancel() {
      await pieces.return?.();
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
