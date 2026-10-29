import type { HintRequest, HintResponse } from './hintSchema';

// Same question, same board → same answer. Saves API calls when a student asks twice.
const cache = new Map<string, string>();

/** Asks the server for an AI hint. Throws if the hint service is unavailable. */
export async function requestHint(request: HintRequest): Promise<string> {
  const key = JSON.stringify(request);
  const cached = cache.get(key);
  if (cached) return cached;

  const response = await fetch('/api/hint', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: key,
  });
  const data = (await response.json().catch(() => ({}))) as HintResponse;
  if (!response.ok || !data.hint) {
    throw new Error(data.error ?? `Hint request failed (${response.status})`);
  }

  cache.set(key, data.hint);
  return data.hint;
}

/** For tests. */
export function clearHintCache(): void {
  cache.clear();
}
