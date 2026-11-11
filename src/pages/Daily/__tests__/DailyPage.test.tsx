import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { buildDailyLevel, todayKey } from '@/features/daily';
import { useProgressStore } from '@/features/progress';
import { usePlayerStore } from '@/features/rewards';
import { useSettingsStore } from '@/features/settings';
import { findSolutions } from '@/features/simulation';
import DailyPage from '../DailyPage';

function renderDaily() {
  const router = createMemoryRouter(
    [
      { path: '/daily', element: <DailyPage /> },
      { path: '/', element: <p>Home page</p> },
    ],
    { initialEntries: ['/daily'] },
  );
  render(<RouterProvider router={router} />);
}

/** Places today's solution on the board and tests it. */
function solveToday() {
  const level = buildDailyLevel(todayKey());
  const [solution] = findSolutions(level, level.toolbox);
  const toolbar = screen.getByRole('toolbar');
  for (const [slotId, gate] of Object.entries(solution)) {
    const button = within(toolbar).getByRole('button', { name: new RegExp(`^${gate}`) });
    if (button.getAttribute('aria-pressed') !== 'true') fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Slot ${slotId},`) }));
  }
  fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
}

describe('DailyPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {}, lessons: {} });
    useSettingsStore.setState({ sound: false, colorBlind: false });
    usePlayerStore.getState().resetPlayer();
  });

  it("shows today's puzzle with its truth table", () => {
    renderDaily();
    expect(screen.getByRole('heading', { name: 'Daily Challenge' })).toBeInTheDocument();
    expect(screen.getByText(/build Y =/i)).toBeInTheDocument();
    expect(screen.getByText(/of 8/i)).toBeInTheDocument();
  });

  it('starts a streak and gives the daily reward once a day', () => {
    renderDaily();
    solveToday();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('1-day streak');
    expect(dialog).not.toHaveTextContent(/district/i);
    expect(usePlayerStore.getState().daily).toEqual({ lastDate: todayKey(), streak: 1 });

    fireEvent.click(within(dialog).getByRole('button', { name: /play again/i }));
    solveToday();
    expect(screen.getByRole('dialog')).toHaveTextContent(/already done today/i);
    expect(usePlayerStore.getState().stats.dailySolved).toBe(1);
  });
});
