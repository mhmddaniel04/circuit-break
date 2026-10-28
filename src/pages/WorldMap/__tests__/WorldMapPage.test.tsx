import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useProgressStore } from '@/features/progress';
import WorldMapPage from '../WorldMapPage';

function renderMap() {
  const router = createMemoryRouter([{ path: '/worlds', element: <WorldMapPage /> }], {
    initialEntries: ['/worlds'],
  });
  render(<RouterProvider router={router} />);
}

describe('WorldMapPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {} });
  });

  it('opens the first level and locks the rest', () => {
    renderMap();
    expect(screen.getByRole('link', { name: /flip the switch/i })).toHaveAttribute(
      'href',
      '/level/w1-l1',
    );
    expect(screen.queryByRole('link', { name: /double lock/i })).not.toBeInTheDocument();
    expect(screen.getByText(/double lock/i)).toBeInTheDocument();
  });

  it('unlocks the next level and shows stars after a level is completed', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 2, score: 900, seconds: 20 });
    renderMap();
    expect(screen.getByRole('link', { name: /double lock/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /2 of 3 stars/i })).toBeInTheDocument();
    expect(screen.getByText(/★ 2 \//)).toBeInTheDocument();
  });

  it('shows worlds without levels as coming soon', () => {
    renderMap();
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });
});
