import { createGeminiGenerator } from './gemini.js';
import { handleHintRequest, type HintGenerator } from './hintHandler.js';
import { createRateLimiter } from './rateLimit.js';

export interface HintEnv {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

export interface HintRouteDeps {
  createGenerator: (apiKey: string, model?: string) => HintGenerator;
  isRateLimited: (visitor: string) => boolean;
}

const defaultDeps: HintRouteDeps = {
  createGenerator: createGeminiGenerator,
  // 20 hints per minute per visitor is plenty for a class.
  isRateLimited: createRateLimiter(20, 60_000),
};

const json = (body: unknown, status: number) => Response.json(body, { status });

/** POST /api/hint. Used by both the Vercel function and the local dev server. */
export async function handleHintHttp(
  request: Request,
  env: HintEnv,
  deps: HintRouteDeps = defaultDeps,
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

  const generator = deps.createGenerator(env.GEMINI_API_KEY, env.GEMINI_MODEL || undefined);
  const result = await handleHintRequest(body, generator);
  return json(result.body, result.status);
}