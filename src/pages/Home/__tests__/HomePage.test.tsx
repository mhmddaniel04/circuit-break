import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useProgressStore } from '@/features/progress';
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
  beforeEach(() => useProgressStore.setState({ levels: {}, lessons: {} }));

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

  it('opens the city map and SPM practice', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: /spm practice/i }));
    expect(screen.getByText('Practice page')).toBeInTheDocument();
  });
});
