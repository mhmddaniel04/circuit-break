import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { battleRounds } from '@/features/boss';
import { useProgressStore } from '@/features/progress';
import { usePlayerStore } from '@/features/rewards';
import { useSettingsStore } from '@/features/settings';
import { findSolutions } from '@/features/simulation';
import type { Level } from '@/levels';
import { BossBattle } from '../BossBattle';

function renderBattle(world: number) {
  const router = createMemoryRouter(
    [
      { path: '/boss', element: <BossBattle world={world} onRestart={() => {}} /> },
      { path: '/worlds', element: <p>City map</p> },
    ],
    { initialEntries: ['/boss'] },
  );
  render(<RouterProvider router={router} />);
}

/** Places a circuit's solution by clicking, like a player. */
function placeSolution(level: Level) {
  const [solution] = findSolutions(level, level.toolbox);
  const toolbar = screen.getByRole('toolbar');
  for (const [slotId, gate] of Object.entries(solution)) {
    const button = within(toolbar).getByRole('button', { name: new RegExp(`^${gate}`) });
    if (button.getAttribute('aria-pressed') !== 'true') fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Slot ${slotId},`) }));
  }
}

const hp = () => screen.getByRole('progressbar', { name: /health/i }).getAttribute('aria-valuenow');
const attack = () => fireEvent.click(screen.getByRole('button', { name: /attack/i }));
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('BossBattle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useProgressStore.setState({ levels: {}, lessons: { 1: true, 4: true } });
    useSettingsStore.setState({ sound: false, colorBlind: false });
    usePlayerStore.getState().resetPlayer();
  });
  afterEach(() => vi.useRealTimers());

  it('introduces the boss and its rules before the fight starts', () => {
    renderBattle(1);
    expect(
      screen.getByRole('heading', { name: /flicker is attacking the city/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/faster you fix a circuit, the harder it hits/i)).toBeInTheDocument();
    expect(screen.queryByText(/casts confusion/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /fight/i }));
    expect(hp()).toBe('100');
    expect(screen.getByText('Circuit 1')).toBeInTheDocument();
  });

  it('hits harder for a fast circuit, and defeats the boss after enough hits', () => {
    const rounds = battleRounds(1);
    renderBattle(1);
    fireEvent.click(screen.getByRole('button', { name: /fight/i }));

    // Instant solves: 25 damage + 15 speed bonus = 40, a critical hit.
    placeSolution(rounds[0]);
    attack();
    expect(hp()).toBe('60');
    expect(screen.getByText('CRITICAL!')).toBeInTheDocument();
    wait(1300);
    expect(screen.getByText('Circuit 2')).toBeInTheDocument();

    placeSolution(rounds[1]);
    attack();
    wait(1300);
    placeSolution(rounds[2]);
    attack();
    expect(hp()).toBe('0');
    wait(900);

    expect(screen.getByRole('dialog')).toHaveTextContent(/flicker defeated/i);
    expect(useProgressStore.getState().levels['w1-l5']?.stars).toBe(3);
    expect(usePlayerStore.getState().stats.bossesBeaten).toEqual(['w1-l5']);
  });

  it('lets the boss charge 8 seconds closer after a wrong test', () => {
    useProgressStore.setState({ lessons: { 2: true } });
    renderBattle(2);
    fireEvent.click(screen.getByRole('button', { name: /fight/i }));
    expect(screen.getByRole('timer')).toHaveTextContent('4:42');

    // Circuit 1 is "Not Yet" (A = 1, B = 0 must stay OFF): OR lights the bulb, which is wrong.
    fireEvent.click(within(screen.getByRole('toolbar')).getByRole('button', { name: /^OR/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Slot s1,/ }));
    attack();

    expect(screen.getByRole('timer')).toHaveTextContent('4:34');
    expect(hp()).toBe('100');
    expect(screen.getByText('Circuit 1')).toBeInTheDocument();
  });

  it('is lost when the boss reaches the city', () => {
    renderBattle(1);
    fireEvent.click(screen.getByRole('button', { name: /fight/i }));
    wait(203_000);
    expect(screen.getByRole('dialog')).toHaveTextContent(/flicker reached the city/i);
    expect(useProgressStore.getState().levels['w1-l5']).toBeUndefined();
  });

  it('hides the chips for a few seconds when Static casts confusion', () => {
    const rounds = battleRounds(4);
    renderBattle(4);
    expect(screen.getByText(/casts confusion/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /fight/i }));
    const [solution] = findSolutions(rounds[0], rounds[0].toolbox);
    const [slotId, gate] = Object.entries(solution)[0];
    fireEvent.click(
      within(screen.getByRole('toolbar')).getByRole('button', { name: new RegExp(`^${gate}`) }),
    );
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Slot ${slotId},`) }));

    wait(10_500);
    expect(screen.getByText(/charging up confusion/i)).toBeInTheDocument();
    wait(2_000);
    expect(
      screen.getByRole('button', { name: new RegExp(`Slot ${slotId}, gate hidden`) }),
    ).toBeInTheDocument();
    wait(3_000);
    expect(
      screen.getByRole('button', { name: new RegExp(`Slot ${slotId}, ${gate} gate`) }),
    ).toBeInTheDocument();
  });
});
