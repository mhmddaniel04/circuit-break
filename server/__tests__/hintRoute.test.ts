// @vitest-environment node
import { sampleHintRequest } from './fixtures.js';
import { handleHintHttp, type HintRouteDeps } from '../hintRoute.js';

const body = JSON.stringify(sampleHintRequest);
const post = (text = body) => new Request('http://test/api/hint', { method: 'POST', body: text });

function deps(overrides: Partial<HintRouteDeps> = {}): HintRouteDeps {
  return {
    createGenerator: () => async () => 'Which gate turns 1 into 0?',
    isRateLimited: () => false,
    ...overrides,
  };
}

describe('handleHintHttp', () => {
  const env = { GEMINI_API_KEY: 'test-key' };

  it('answers a valid POST with a hint', async () => {
    const response = await handleHintHttp(post(), env, deps());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hint: 'Which gate turns 1 into 0?' });
  });

  it('only accepts POST', async () => {
    const response = await handleHintHttp(new Request('http://test/api/hint'), env, deps());
    expect(response.status).toBe(405);
  });

  it('reports a missing API key', async () => {
    const response = await handleHintHttp(post(), {}, deps());
    expect(response.status).toBe(503);
  });

  it('blocks visitors who ask too often', async () => {
    const response = await handleHintHttp(post(), env, deps({ isRateLimited: () => true }));
    expect(response.status).toBe(429);
  });

  it('rejects a body that is not JSON', async () => {
    const response = await handleHintHttp(post('not json'), env, deps());
    expect(response.status).toBe(400);
  });

  it('passes the chosen model to the generator', async () => {
    const createGenerator = vi.fn(() => async () => 'ok');
    await handleHintHttp(post(), { ...env, GEMINI_MODEL: 'my-model' }, deps({ createGenerator }));
    expect(createGenerator).toHaveBeenCalledWith('test-key', 'my-model');
  });
});