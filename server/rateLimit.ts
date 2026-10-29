/**
 * A simple in-memory limit: each visitor may ask for `limit` hints per `windowMs`.
 * Serverless functions can run on several machines, so this is a speed bump, not a hard guarantee.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const requests = new Map<string, number[]>();

  return function isRateLimited(visitor: string, now = Date.now()): boolean {
    const recent = (requests.get(visitor) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      requests.set(visitor, recent);
      return true;
    }
    recent.push(now);
    requests.set(visitor, recent);
    return false;
  };
}
