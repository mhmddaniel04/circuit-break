import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useProgressStore } from '@/features/progress';
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
    useProgressStore.setState({ levels: {} });
  });

  it('gives 3 stars and saves progress for a first-try solve', () => {
    renderLevel('w1-l1');
    solveFirstLevel();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/circuit complete/i);
    expect(screen.getByRole('img', { name: /3 of 3 stars/i })).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/new best score/i);
    expect(useProgressStore.getState().levels['w1-l1']?.stars).toBe(3);
  });

  it('gives only 1 star after using a hint', () => {
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /💡/ }));
    fireEvent.click(screen.getByRole('button', { name: /show hint/i }));
    expect(screen.getByText(/bit says/i)).toBeInTheDocument();
    solveFirstLevel();
    expect(screen.getByRole('img', { name: /1 of 3 stars/i })).toBeInTheDocument();
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
  });

  it('blocks a level that is still locked', () => {
    renderLevel('w2-l1');
    expect(screen.getByText(/this level is locked/i)).toBeInTheDocument();
  });

  it('shows a message for an unknown level', () => {
    renderLevel('w9-l9');
    expect(screen.getByText(/level not found/i)).toBeInTheDocument();
  });
});
