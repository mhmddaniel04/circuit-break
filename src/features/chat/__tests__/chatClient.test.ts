import { ChatRequestError, cleanChatText, streamChat } from '../chatClient';
import type { ChatRequest } from '../chatSchema';

const request: ChatRequest = { lang: 'en', world: 1, messages: [{ role: 'user', text: 'Hi' }] };

/** A response whose body arrives in several pieces, like a real stream. */
function streamedResponse(pieces: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      pieces.forEach((piece) => controller.enqueue(encoder.encode(piece)));
      controller.close();
    },
  });
  return new Response(body, { headers: { 'content-type': 'text/plain' } });
}

describe('streamChat', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the answer piece by piece and returns the full text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamedResponse(['NOT ', 'flips ', 'it.'])));
    const seen: string[] = [];
    expect(await streamChat(request, (text) => seen.push(text))).toBe('NOT flips it.');
    expect(seen).toEqual(['NOT ', 'NOT flips ', 'NOT flips it.']);
  });

  it('reports too many questions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ error: 'rate_limited' }, { status: 429 })),
    );
    await expect(streamChat(request, () => {})).rejects.toMatchObject({ reason: 'rate_limited' });
  });

  it('reports a missing internet connection', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(streamChat(request, () => {})).rejects.toBeInstanceOf(ChatRequestError);
    await expect(streamChat(request, () => {})).rejects.toMatchObject({ reason: 'offline' });
  });
});

describe('cleanChatText', () => {
  it('removes markdown symbols', () => {
    expect(cleanChatText('**AND** gives `1`\n* when A = 1\n# Tip')).toBe(
      'AND gives 1\n• when A = 1\nTip',
    );
  });
});
