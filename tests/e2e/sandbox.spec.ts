import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('the sandbox builds any circuit and shows its truth table live @mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /sandbox lab/i }).click();
  await expect(page.getByRole('heading', { name: 'Sandbox Lab' })).toBeVisible();

  await page.getByRole('toolbar').getByRole('button', { name: /^AND/ }).click();
  await page.getByRole('button', { name: /^Slot P,/ }).click();
  await expect(page.getByText('Y = A AND B')).toBeVisible();
  await page.getByRole('switch', { name: /switch A = 0/i }).click();
  await page.getByRole('switch', { name: /switch B = 0/i }).click();
  await expect(page.getByRole('img', { name: /bulb Y shows 1/i })).toBeVisible();
});

test('a skin bought in the shop changes the board colours', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem(
      'cb.player',
      JSON.stringify({ state: { xp: 0, coins: 500, unlocked: {} }, version: 1 }),
    ),
  );
  await page.goto('/skins');
  await page.getByRole('listitem').filter({ hasText: 'Gold' }).getByRole('button').click();
  await expect(page.locator('html')).toHaveAttribute('data-skin', 'gold');
  await page.goto('/sandbox');
  // The board colour comes from the skin.
  await expect(page.locator('html')).toHaveCSS('--board', '#1e1e1e');
});
