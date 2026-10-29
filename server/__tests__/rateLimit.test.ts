// @vitest-environment node
import { createRateLimiter } from '../rateLimit.js';

describe('createRateLimiter', () => {
  it('allows up to the limit, then blocks until the window passes', () => {
    const isRateLimited = createRateLimiter(2, 1000);
    expect(isRateLimited('student', 0)).toBe(false);
    expect(isRateLimited('student', 100)).toBe(false);
    expect(isRateLimited('student', 200)).toBe(true);
    expect(isRateLimited('other', 200)).toBe(false);
    expect(isRateLimited('student', 1500)).toBe(false);
  });
});
