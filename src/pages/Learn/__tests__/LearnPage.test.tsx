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
  it('links to the lesson of every world', () => {
    renderLearn();
    const lessons = within(screen.getByRole('region', { name: 'Lessons' })).getAllByRole('link');
    expect(lessons.map((link) => link.getAttribute('href'))).toEqual([
      '/lesson/1',
      '/lesson/2',
      '/lesson/3',
      '/lesson/4',
      '/lesson/5',
    ]);
  });

  it('links to SPM practice and the cheat sheet', () => {
    renderLearn();
    expect(screen.getByRole('link', { name: /spm practice/i })).toHaveAttribute(
      'href',
      '/practice',
    );
    expect(screen.getByRole('link', { name: /cheat sheet/i })).toHaveAttribute(
      'href',
      '/cheatsheet',
    );
  });

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
