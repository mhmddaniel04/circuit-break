import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import i18n from '@/i18n';
import { useProgressStore } from '@/features/progress';
import { useSettingsStore } from '@/features/settings';
import SettingsPage from '../SettingsPage';

function renderSettings() {
  const router = createMemoryRouter([{ path: '/settings', element: <SettingsPage /> }], {
    initialEntries: ['/settings'],
  });
  render(<RouterProvider router={router} />);
}

describe('SettingsPage', () => {
  beforeEach(async () => {
    localStorage.clear();
    useSettingsStore.setState({ sound: true, colorBlind: false });
    useProgressStore.setState({ levels: {} });
    await i18n.changeLanguage('en');
  });

  it('turns sound and colour-blind mode on and off', () => {
    renderSettings();
    const sound = screen.getByRole('switch', { name: /sound effects/i });
    expect(sound).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(sound);
    expect(useSettingsStore.getState().sound).toBe(false);

    fireEvent.click(screen.getByRole('switch', { name: /colour-blind mode/i }));
    expect(useSettingsStore.getState().colorBlind).toBe(true);
  });

  it('switches the language', async () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Bahasa Melayu' }));
    expect(await screen.findByRole('heading', { name: 'Tetapan' })).toBeInTheDocument();
    await i18n.changeLanguage('en');
  });

  it('resets progress only after confirming', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 3, score: 1000, seconds: 10 });
    renderSettings();

    fireEvent.click(screen.getByRole('button', { name: /reset progress/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(useProgressStore.getState().levels['w1-l1']).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /reset progress/i }));
    fireEvent.click(screen.getByRole('button', { name: /yes, reset/i }));
    expect(useProgressStore.getState().levels).toEqual({});
    expect(screen.getByRole('status')).toHaveTextContent(/progress reset/i);
  });
});
