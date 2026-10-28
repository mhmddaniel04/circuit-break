import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import LearnPage from '../LearnPage';

function renderLearn() {
  const router = createMemoryRouter([{ path: '/learn', element: <LearnPage /> }], {
    initialEntries: ['/learn'],
  });
  render(<RouterProvider router={router} />);
}

describe('LearnPage', () => {
  it('shows a card with a truth table for every gate', () => {
    renderLearn();
    for (const gate of ['NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR']) {
      expect(screen.getByRole('heading', { name: gate })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('table')).toHaveLength(6);
  });

  it('lets the player try the AND gate with switches', () => {
    renderLearn();
    const card = screen.getByRole('region', { name: 'AND' });
    const output = within(card).getByRole('img', { name: /output/i });
    expect(output).toHaveTextContent('0');

    fireEvent.click(within(card).getByRole('button', { name: /input A/i }));
    expect(output).toHaveTextContent('0');
    fireEvent.click(within(card).getByRole('button', { name: /input B/i }));
    expect(output).toHaveTextContent('1');
  });
});
