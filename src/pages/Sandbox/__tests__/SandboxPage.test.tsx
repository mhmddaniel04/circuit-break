import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useSettingsStore } from '@/features/settings';
import SandboxPage from '../SandboxPage';

function renderSandbox() {
  const router = createMemoryRouter([{ path: '/sandbox', element: <SandboxPage /> }], {
    initialEntries: ['/sandbox'],
  });
  render(<RouterProvider router={router} />);
}

const outputColumn = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell').at(-1)!.textContent);

describe('SandboxPage', () => {
  beforeEach(() => useSettingsStore.setState({ sound: false, colorBlind: false }));

  it('fills in the truth table and expression live as gates are placed', () => {
    renderSandbox();
    expect(screen.getByText(/fill every slot/i)).toBeInTheDocument();
    expect(outputColumn()).toEqual(['·', '·', '·', '·']);

    fireEvent.click(within(screen.getByRole('toolbar')).getByRole('button', { name: /^XOR/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Slot P,/ }));
    expect(outputColumn()).toEqual(['0', '1', '1', '0']);
    expect(screen.getByText('Y = A XOR B')).toBeInTheDocument();
    // No goal in the sandbox, and no gate counts.
    expect(screen.queryByText(/must be ON/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/left$/)).not.toBeInTheDocument();
  });

  it('lets any gate be swapped in and the switches be flipped', () => {
    renderSandbox();
    fireEvent.click(within(screen.getByRole('toolbar')).getByRole('button', { name: /^NOR/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Slot P,/ }));
    fireEvent.click(screen.getByRole('switch', { name: /switch A = 0/i }));
    expect(screen.getByRole('img', { name: /bulb Y shows 0/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: /switch A = 1/i }));
    expect(screen.getByRole('img', { name: /bulb Y shows 1/i })).toBeInTheDocument();
  });

  it('offers bigger circuit shapes', () => {
    renderSandbox();
    fireEvent.click(screen.getByRole('button', { name: '4-input tree' }));
    expect(screen.getByRole('button', { name: '4-input tree' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(17);
  });
});
