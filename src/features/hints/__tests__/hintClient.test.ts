import { getLevel } from '@/levels';
import { clearHintCache, requestHint } from '../hintClient';
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
});