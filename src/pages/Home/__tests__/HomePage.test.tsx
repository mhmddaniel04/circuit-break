import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { todayKey } from '@/features/daily';
import { useProgressStore } from '@/features/progress';
import { usePlayerStore } from '@/features/rewards';
import { getLevelsByWorld } from '@/levels';
import HomePage from '../HomePage';

function renderHome() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HomePage /> },
      { path: '/worlds', element: <p>City map</p> },
      { path: '/practice', element: <p>Practice page</p> },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

describe('HomePage', () => {
  beforeEach(() => {
    useProgressStore.setState({ levels: {}, lessons: {} });
    usePlayerStore.getState().resetPlayer();
  });

  it('shows Bit and the district to continue with', () => {
    renderHome();
    expect(screen.getByRole('img', { name: /bit the robot/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toHaveTextContent('District 1');
  });

  it('continues from the first district that still needs work', () => {
    const done = { stars: 3 as const, bestScore: 1000, bestSeconds: 10 };
    useProgressStore.setState({
      levels: Object.fromEntries(getLevelsByWorld(1).map((level) => [level.id, done])),
    });
    renderHome();
    expect(screen.getByRole('button', { name: /play/i })).toHaveTextContent('AND Factory');
    expect(screen.getByText(/★/).parentElement).toHaveTextContent('15 /');
  });

  it('shows the daily challenge and the streak', () => {
    usePlayerStore.setState({ daily: { lastDate: todayKey(), streak: 4 } });
    renderHome();
    const daily = screen.getByRole('button', { name: /daily challenge/i });
    expect(daily).toHaveTextContent(/done today/i);
    expect(daily).toHaveTextContent('4-day streak');
  });

  it('opens the city map and SPM practice', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /spm practice/i }));
    expect(screen.getByText('Practice page')).toBeInTheDocument();
  });
});
