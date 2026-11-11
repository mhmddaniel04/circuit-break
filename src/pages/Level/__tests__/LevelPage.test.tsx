import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { clearHintCache } from '@/features/hints/hintClient';
import { useProgressStore } from '@/features/progress';
import { useSettingsStore } from '@/features/settings';
import { LEVELS } from '@/levels';
import LevelPage from '../LevelPage';

function renderLevel(levelId: string) {
  const router = createMemoryRouter(
    [
      { path: '/worlds', element: <p>World map</p> },
      { path: '/level/:levelId', element: <LevelPage /> },
    ],
    { initialEntries: [`/level/${levelId}`] },
  );
  render(<RouterProvider router={router} />);
}

function unlockAllLevels() {
  for (const level of LEVELS) {
    useProgressStore.getState().recordResult(level.id, { stars: 1, score: 100, seconds: 99 });
  }
}

function solveFirstLevel() {
  fireEvent.click(screen.getByRole('button', { name: /^NOT/ }));
  fireEvent.click(screen.getByRole('button', { name: /slot s1/i }));
  fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
}

describe('LevelPage', () => {
  beforeEach(() => {
    localStorage.clear();
    // Every lesson is passed, so only the level order decides what is locked.
    useProgressStore.setState({
      levels: {},
      lessons: { 1: true, 2: true, 3: true, 4: true, 5: true },
    });
    useSettingsStore.setState({ sound: false, colorBlind: false });
    clearHintCache();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('gives 3 stars and saves progress for a first-try solve', () => {
    renderLevel('w1-l1');
    solveFirstLevel();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/circuit complete/i);
    expect(screen.getByRole('img', { name: /3 of 3 stars/i })).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/new best score/i);
    expect(useProgressStore.getState().levels['w1-l1']?.stars).toBe(3);
    expect(screen.getByTestId('confetti')).toBeInTheDocument();
  });

  it('can be played with the keyboard', () => {
    renderLevel('w1-l1');
    fireEvent.keyDown(window, { key: 't' });
    expect(screen.getByRole('status')).toHaveTextContent(/fill every slot/i);

    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByRole('status')).toHaveTextContent(/place the NOT gate/i);
    fireEvent.keyDown(screen.getByRole('button', { name: /slot s1/i }), { key: 'Enter' });
    fireEvent.keyDown(window, { key: 't' });
    expect(screen.getByRole('dialog')).toHaveTextContent(/circuit complete/i);
  });

  it('writes 0 and 1 on the wires in colour-blind mode', () => {
    useSettingsStore.setState({ colorBlind: true });
    renderLevel('w1-l1');
    solveFirstLevel();
    const labels = [...document.querySelectorAll('[data-signal]')].map((label) =>
      label.getAttribute('data-signal'),
    );
    expect(labels).toEqual(['1', '0']); // A → NOT is 1, NOT → Y is 0
  });

  it('shows an AI hint from Bit and gives only 1 star afterwards', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ hint: 'Think about NOT.' })));
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^💡 hint/i }));
    fireEvent.click(screen.getByRole('button', { name: /show hint/i }));
    expect(await screen.findByText('Think about NOT.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /another hint \(1\/3\)/i })).toBeInTheDocument();
    solveFirstLevel();
    expect(screen.getByRole('img', { name: /1 of 3 stars/i })).toBeInTheDocument();
    expect(screen.queryByTestId('confetti')).not.toBeInTheDocument();
  });

  it('falls back to the written hint when the AI is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^💡 hint/i }));
    fireEvent.click(screen.getByRole('button', { name: /show hint/i }));
    expect(await screen.findByText(/which gate turns 1 into 0/i)).toBeInTheDocument();
    expect(screen.getByText(/offline hint/i)).toBeInTheDocument();
  });

  it('asks the player to fill empty slots before testing', () => {
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/fill every slot/i);
  });

  it('shows the truth-table results when the circuit is wrong', () => {
    unlockAllLevels();
    renderLevel('w2-l1');
    fireEvent.click(screen.getByRole('button', { name: /^OR/ }));
    fireEvent.click(screen.getByRole('button', { name: /slot s1/i }));
    fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5); // header + 4 cases
    // A = 0, B = 1: OR lights the bulb, but it should be off, so it is marked wrong.
    expect(screen.getByRole('img', { name: /bulb Y is wrong \(needs 0\)/i })).toBeInTheDocument();
  });

  it('blocks a level that is still locked', () => {
    renderLevel('w2-l1');
    expect(screen.getByText(/this level is locked/i)).toBeInTheDocument();
  });

  it('sends the player to the lesson when it has not been passed yet', () => {
    useProgressStore.setState({ lessons: {} });
    renderLevel('w1-l1');
    expect(screen.getByText(/read the district 1 lesson first/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open the lesson/i })).toHaveAttribute(
      'href',
      '/lesson/1',
    );
  });

  it('shows a message for an unknown level', () => {
    renderLevel('w9-l9');
    expect(screen.getByText(/level not found/i)).toBeInTheDocument();
  });
});
