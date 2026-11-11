// @vitest-environment node
import type { ChatRequest } from '../../src/features/chat/chatSchema.js';
import { handleChatHttp, type ChatRouteDeps, type ChatStreamer } from '../chatRoute.js';

const question: ChatRequest = {
  lang: 'en',
  world: 2,
  messages: [{ role: 'user', text: 'What does AND do?' }],
};

const post = (body: unknown = question) =>
  new Request('http://test/api/chat', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const fakeStreamer = (...pieces: string[]): ChatStreamer =>
  async function* () {
    yield* pieces;
  };

function deps(overrides: Partial<ChatRouteDeps> = {}): ChatRouteDeps {
  return {
    createStreamer: () => fakeStreamer('AND gives 1 ', 'only when both inputs are 1.'),
    isRateLimited: () => false,
    ...overrides,
  };
}

describe('handleChatHttp', () => {
  const env = { GEMINI_API_KEY: 'test-key' };

  it('streams the answer as plain text', async () => {
    const response = await handleChatHttp(post(), env, deps());
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(await response.text()).toBe('AND gives 1 only when both inputs are 1.');
  });

  it('only accepts POST', async () => {
    const response = await handleChatHttp(new Request('http://test/api/chat'), env, deps());
    expect(response.status).toBe(405);
  });

  it('reports a missing API key', async () => {
    expect((await handleChatHttp(post(), {}, deps())).status).toBe(503);
  });

  it('blocks visitors who ask too often', async () => {
    const response = await handleChatHttp(post(), env, deps({ isRateLimited: () => true }));
    expect(response.status).toBe(429);
  });

  it('rejects a body that is not JSON', async () => {
    expect((await handleChatHttp(post('not json'), env, deps())).status).toBe(400);
  });

  it('rejects a conversation that does not end with a question', async () => {
    const body = { ...question, messages: [{ role: 'bit', text: 'Hello!' }] };
    expect((await handleChatHttp(post(body), env, deps())).status).toBe(400);
  });

  it('rejects a question that is too long', async () => {
    const body = { ...question, messages: [{ role: 'user', text: 'a'.repeat(301) }] };
    expect((await handleChatHttp(post(body), env, deps())).status).toBe(400);
  });

  it('reports a failing AI service before any text is sent', async () => {
    const failing: ChatStreamer = async function* () {
      yield* [];
      throw new Error('quota exceeded');
    };
    const response = await handleChatHttp(post(), env, deps({ createStreamer: () => failing }));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'ai_unavailable' });
  });

  it('reports an empty answer', async () => {
    const response = await handleChatHttp(
      post(),
      env,
      deps({ createStreamer: () => fakeStreamer() }),
    );
    expect(response.status).toBe(502);
  });

  it('keeps the text already sent if the AI stops halfway', async () => {
    const halfway: ChatStreamer = async function* () {
      yield 'AND gives 1';
      throw new Error('connection lost');
    };
    const response = await handleChatHttp(post(), env, deps({ createStreamer: () => halfway }));
    expect(await response.text()).toBe('AND gives 1');
  });

  it('passes the chosen model to the streamer', async () => {
    const createStreamer = vi.fn(() => fakeStreamer('ok'));
    await handleChatHttp(post(), { ...env, GEMINI_MODEL: 'my-model' }, deps({ createStreamer }));
    expect(createStreamer).toHaveBeenCalledWith('test-key', 'my-model');
  });
});
