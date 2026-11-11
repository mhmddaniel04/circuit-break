import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { clearHintCache } from '@/features/hints/hintClient';
import { useProgressStore } from '@/features/progress';
import { usePlayerStore } from '@/features/rewards';
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
    usePlayerStore.getState().resetPlayer();
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

  it('sells a hint for coins without taking stars away', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ hint: 'Think about NOT.' })));
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^💡 hint/i }));
    expect(screen.getByText(/costs 5 coins\. you have 30/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /buy hint · 5 coins/i }));

    expect(await screen.findByText('Think about NOT.')).toBeInTheDocument();
    expect(usePlayerStore.getState().coins).toBe(25);
    expect(screen.getByRole('button', { name: /another hint · 10 coins/i })).toBeInTheDocument();
    solveFirstLevel();
    expect(screen.getByRole('img', { name: /3 of 3 stars/i })).toBeInTheDocument();
  });

  it('cannot buy a hint without enough coins', () => {
    usePlayerStore.setState({ coins: 2 });
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^💡 hint/i }));
    expect(screen.getByRole('button', { name: /buy hint/i })).toBeDisabled();
    expect(screen.getByText(/not enough coins/i)).toBeInTheDocument();
  });

  it('falls back to the written hint when the AI is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^💡 hint/i }));
    fireEvent.click(screen.getByRole('button', { name: /buy hint/i }));
    expect(await screen.findByText(/which gate turns 1 into 0/i)).toBeInTheDocument();
    expect(screen.getByText(/offline hint/i)).toBeInTheDocument();
  });

  it('gives the coins back when no hint can be given at all', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^💡 hint/i }));
    fireEvent.click(screen.getByRole('button', { name: /buy hint/i }));
    await screen.findByText(/offline hint/i);
    // The written hint was the only one: the next one fails, so its 10 coins come back.
    fireEvent.click(screen.getByRole('button', { name: /another hint/i }));
    expect(await screen.findByText(/can't connect/i)).toBeInTheDocument();
    expect(usePlayerStore.getState().coins).toBe(25);
  });

  it('shows the XP, coins and badges a solved level earns', () => {
    useProgressStore.setState({ lessons: { 1: true } });
    renderLevel('w1-l1');
    solveFirstLevel();
    const dialog = screen.getByRole('dialog');
    // 3 stars on a new level: 125 XP and 15 coins, plus 50 XP and 25 coins for "First Light".
    expect(dialog).toHaveTextContent('+175 XP');
    expect(dialog).toHaveTextContent('+40 coins');
    expect(dialog).toHaveTextContent('First Light');
    expect(usePlayerStore.getState().coins).toBe(70);
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
    expect(
      screen.getByRole('img', { name: /bulb Y is wrong \(must stay OFF\)/i }),
    ).toBeInTheDocument();
  });

  it('starts a truth-table level on a row where the bulb must be ON', () => {
    unlockAllLevels();
    renderLevel('w2-l1');
    // Double Lock is A AND B: only A = 1, B = 1 (row 4) needs the bulb ON.
    expect(screen.getByText(/row 4 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /bulb Y must be ON/i })).toBeInTheDocument();
  });

  it('lights the bulb straight away when the circuit gives 1', () => {
    unlockAllLevels();
    renderLevel('w2-l1');
    fireEvent.click(screen.getByRole('button', { name: /^AND/ }));
    fireEvent.click(screen.getByRole('button', { name: /slot s1/i }));
    // No test yet, but power already flows: A = 1 and B = 1 light the bulb.
    expect(document.querySelector('[data-lit="true"]')).not.toBeNull();
  });

  it('lets the player flip the switches to try other rows', () => {
    unlockAllLevels();
    renderLevel('w2-l1');
    fireEvent.click(screen.getByRole('switch', { name: /switch A = 1/i }));
    expect(screen.getByText(/row 2 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /switch A = 0/i })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('img', { name: /bulb Y must stay OFF/i })).toBeInTheDocument();
  });

  it('shows the goal for every row before the first test', () => {
    unlockAllLevels();
    renderLevel('w2-l1');
    expect(screen.getByRole('table', { name: /truth table/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /show row 1 on the board/i }));
    expect(screen.getByText(/row 1 of 4/i)).toBeInTheDocument();
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
