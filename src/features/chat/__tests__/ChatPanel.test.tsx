import { act, fireEvent, render, screen } from '@testing-library/react';
import '@/i18n';
import { ChatPanel } from '../components/ChatPanel';
import { FIRST_WORDS_TIMEOUT_MS } from '../useChat';

function answerWith(text: string) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(text));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function openChat(world: number | null = 1) {
  render(<ChatPanel world={world} />);
  fireEvent.click(screen.getByRole('button', { name: /ask bit/i }));
}

const sentBody = (fetchMock: ReturnType<typeof vi.fn>) =>
  JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);

describe('ChatPanel', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('opens with a welcome and questions to try', () => {
    openChat();
    expect(screen.getByRole('dialog', { name: /ask bit/i })).toBeInTheDocument();
    expect(screen.getByText(/hi, i'm bit/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /why is not called an inverter/i }),
    ).toBeInTheDocument();
  });

  it('answers a suggested question instantly from the answer bank, without the internet', async () => {
    const fetchMock = answerWith('should not be used');
    openChat(1);
    fireEvent.click(screen.getByRole('button', { name: /why is not called an inverter/i }));

    expect(await screen.findByText(/inverts \(flips\) the signal/i)).toBeInTheDocument();
    expect(screen.getByText(/instant answer/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a new question to the AI with the lesson world and related notes', async () => {
    const fetchMock = answerWith('Yes, a flip-flop stores one bit.');
    openChat(null);
    const box = screen.getByRole('textbox', { name: /ask a question/i });
    fireEvent.change(box, { target: { value: 'Can a computer remember things with flip-flops?' } });
    fireEvent.keyDown(box, { key: 'Enter' });

    expect(await screen.findByText('Yes, a flip-flop stores one bit.')).toBeInTheDocument();
    expect(screen.queryByText(/instant answer/i)).not.toBeInTheDocument();
    const body = sentBody(fetchMock);
    expect(body.world).toBeNull();
    expect(body.messages).toEqual([
      { role: 'user', text: 'Can a computer remember things with flip-flops?' },
    ]);
    expect(body.reference[0]).toMatch(/billions of tiny switches/);
    expect(box).toHaveValue('');
  });

  it('stops waiting for a slow AI and shows the closest note instead', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) =>
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('', 'AbortError')),
            ),
          ),
      ),
    );
    openChat();
    const box = screen.getByRole('textbox', { name: /ask a question/i });
    fireEvent.change(box, { target: { value: 'Can a computer remember things with flip-flops?' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(await screen.findByText(/bit is thinking/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(FIRST_WORDS_TIMEOUT_MS);
    });
    expect(await screen.findByText(/taking too long/i)).toBeInTheDocument();
    expect(screen.getByText(/billions of tiny switches/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows a friendly error and keeps the question to try again', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ error: 'rate_limited' }, { status: 429 })),
    );
    openChat();
    const box = screen.getByRole('textbox', { name: /ask a question/i });
    fireEvent.change(box, { target: { value: 'What is NOT?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/wait a minute/i);
    expect(box).toHaveValue('What is NOT?');
  });

  it('starts a new chat', async () => {
    openChat();
    fireEvent.click(screen.getByRole('button', { name: /why is not called an inverter/i }));
    await screen.findByText(/instant answer/i);

    fireEvent.click(screen.getByRole('button', { name: /new chat/i }));
    expect(screen.queryByText(/instant answer/i)).not.toBeInTheDocument();
  });

  it('closes with Escape and gives the focus back to the button', () => {
    openChat();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask bit/i })).toHaveFocus();
  });
});
