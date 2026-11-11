import { fireEvent, render, screen } from '@testing-library/react';
import '@/i18n';
import { ChatPanel } from '../components/ChatPanel';

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

  it('sends a suggested question with the lesson world and shows the answer', async () => {
    const fetchMock = answerWith('Because it inverts the signal.');
    openChat(1);
    fireEvent.click(screen.getByRole('button', { name: /why is not called an inverter/i }));

    expect(await screen.findByText('Because it inverts the signal.')).toBeInTheDocument();
    expect(sentBody(fetchMock)).toEqual({
      lang: 'en',
      world: 1,
      messages: [{ role: 'user', text: 'Why is NOT called an inverter?' }],
    });
  });

  it('sends a typed question with Enter', async () => {
    const fetchMock = answerWith('XOR gives 1 when the inputs differ.');
    openChat(null);
    const box = screen.getByRole('textbox', { name: /ask a question/i });
    fireEvent.change(box, { target: { value: 'What is XOR?' } });
    fireEvent.keyDown(box, { key: 'Enter' });

    expect(await screen.findByText('XOR gives 1 when the inputs differ.')).toBeInTheDocument();
    expect(sentBody(fetchMock).world).toBeNull();
    expect(box).toHaveValue('');
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
    answerWith('An answer.');
    openChat();
    fireEvent.click(screen.getByRole('button', { name: /why is not called an inverter/i }));
    await screen.findByText('An answer.');

    fireEvent.click(screen.getByRole('button', { name: /new chat/i }));
    expect(screen.queryByText('An answer.')).not.toBeInTheDocument();
  });

  it('closes with Escape and gives the focus back to the button', () => {
    openChat();
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ask bit/i })).toHaveFocus();
  });
});
