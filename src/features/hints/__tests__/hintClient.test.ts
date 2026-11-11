import { getLevel } from '@/levels';
import { clearHintCache, HINT_TIMEOUT_MS, requestHint } from '../hintClient';
import { buildHintRequest } from '../hintRequest';

const request = buildHintRequest(getLevel('w1-l1')!, {}, 1, 'en');

describe('requestHint', () => {
  beforeEach(() => clearHintCache());
  afterEach(() => vi.unstubAllGlobals());

  it('returns the hint from the server and caches it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ hint: 'Try NOT.' }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await requestHint(request)).toBe('Try NOT.');
    expect(await requestHint(request)).toBe('Try NOT.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/hint',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('throws when the server reports an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ error: 'not_configured' }, { status: 503 })),
    );
    await expect(requestHint(request)).rejects.toThrow('not_configured');
  });

  it('gives up when the AI takes too long', async () => {
    vi.useFakeTimers();
    // A server that never answers, until the request is cancelled.
    const neverAnswers = (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    vi.stubGlobal('fetch', vi.fn(neverAnswers));
    const hint = requestHint(request);
    vi.advanceTimersByTime(HINT_TIMEOUT_MS);
    await expect(hint).rejects.toThrow('aborted');
    vi.useRealTimers();
  });
});
