import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import LevelPage from '../LevelPage';

function renderLevel(levelId: string) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <p>Home page</p> },
      { path: '/level/:levelId', element: <LevelPage /> },
    ],
    { initialEntries: [`/level/${levelId}`] },
  );
  render(<RouterProvider router={router} />);
}

describe('LevelPage', () => {
  it('solves the first level by placing a NOT gate', () => {
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /^NOT/ }));
    fireEvent.click(screen.getByRole('button', { name: /slot s1/i }));
    fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent(/circuit complete/i);
  });

  it('asks the player to fill empty slots before testing', () => {
    renderLevel('w1-l1');
    fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/fill every slot/i);
  });

  it('shows the truth-table results when the circuit is wrong', () => {
    renderLevel('w2-l1');
    fireEvent.click(screen.getByRole('button', { name: /^OR/ }));
    fireEvent.click(screen.getByRole('button', { name: /slot s1/i }));
    fireEvent.click(screen.getByRole('button', { name: /test circuit/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5); // header + 4 cases
  });

  it('shows a message for an unknown level', () => {
    renderLevel('w9-l9');
    expect(screen.getByText(/level not found/i)).toBeInTheDocument();
  });
});
