import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { SkinApplier, usePlayerStore } from '@/features/rewards';
import SkinsPage from '../SkinsPage';

function renderShop() {
  const router = createMemoryRouter([{ path: '/skins', element: <SkinsPage /> }], {
    initialEntries: ['/skins'],
  });
  render(
    <>
      <RouterProvider router={router} />
      <SkinApplier />
    </>,
  );
}

const card = (name: string) => screen.getByRole('heading', { name }).closest('li')!;

describe('SkinsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayerStore.getState().resetPlayer();
  });

  it('starts with the Classic skin in use', () => {
    renderShop();
    expect(card('Classic')).toHaveTextContent(/in use/i);
    expect(document.documentElement.dataset.skin).toBe('classic');
  });

  it('buys a skin with coins and puts it on the board', () => {
    usePlayerStore.setState({ coins: 160 });
    renderShop();
    fireEvent.click(within(card('Night')).getByRole('button', { name: /buy · 150 coins/i }));
    expect(usePlayerStore.getState()).toMatchObject({ coins: 10, skin: 'night' });
    expect(document.documentElement.dataset.skin).toBe('night');

    // Owned skins can be swapped back for free.
    fireEvent.click(within(card('Classic')).getByRole('button', { name: /use this skin/i }));
    expect(usePlayerStore.getState()).toMatchObject({ coins: 10, skin: 'classic' });
  });

  it('cannot buy a skin without enough coins', () => {
    renderShop();
    expect(within(card('Gold')).getByRole('button', { name: /buy · 300 coins/i })).toBeDisabled();
    expect(usePlayerStore.getState().buySkin('gold')).toBe(false);
  });
});
