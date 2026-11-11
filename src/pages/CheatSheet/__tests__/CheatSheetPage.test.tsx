import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import CheatSheetPage from '../CheatSheetPage';

function renderCheatSheet() {
  const router = createMemoryRouter([{ path: '/cheatsheet', element: <CheatSheetPage /> }], {
    initialEntries: ['/cheatsheet'],
  });
  render(<RouterProvider router={router} />);
}

describe('CheatSheetPage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows all six gates with a truth table each', () => {
    renderCheatSheet();
    for (const gate of ['NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR']) {
      expect(screen.getByRole('heading', { name: gate })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('table')).toHaveLength(6);
    expect(screen.getByText(/inputs different → 1/i)).toBeInTheDocument();
  });

  it('opens the print window', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderCheatSheet();
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(print).toHaveBeenCalled();
  });
});
