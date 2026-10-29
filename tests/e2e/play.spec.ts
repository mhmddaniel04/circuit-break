import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('a new player solves level 1, earns 3 stars and unlocks level 2 @mobile', async ({ page }) => {
  await page.goto('/worlds');
  await page.getByRole('link', { name: /flip the switch/i }).click();

  await page.getByRole('toolbar').getByRole('button', { name: /^NOT/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Circuit complete!');
  await expect(dialog.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();

  await dialog.getByRole('button', { name: /world map/i }).click();
  await expect(page.getByRole('link', { name: /wake up/i })).toBeVisible();

  // Progress survives a page refresh.
  await page.reload();
  await expect(page.getByText('★ 3 /')).toBeVisible();
});

test('a wrong circuit shows which cases fail', async ({ page }) => {
  await page.goto('/level/w1-l1');
  await page.evaluate(() =>
    localStorage.setItem(
      'cb.progress',
      JSON.stringify({
        state: {
          levels: Object.fromEntries(
            ['w1-l1', 'w1-l2', 'w1-l3', 'w1-l4', 'w1-l5'].map((id) => [
              id,
              { stars: 1, bestScore: 1, bestSeconds: 1 },
            ]),
          ),
        },
        version: 1,
      }),
    ),
  );
  await page.goto('/level/w2-l1');
  await page.getByRole('toolbar').getByRole('button', { name: /^OR/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();

  await expect(page.getByRole('status')).toContainText('Not quite');
  await expect(page.getByRole('img', { name: /bulb Y is wrong/i })).toBeVisible();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(5);
});

test('the whole level can be played with the keyboard only', async ({ page }) => {
  await page.goto('/level/w1-l1');
  await expect(page.getByRole('heading', { name: 'Flip the Switch' })).toBeVisible();
  await page.keyboard.press('1');
  await expect(page.getByRole('status')).toContainText('place the NOT gate');
  await page.getByRole('button', { name: /^Slot s1,/ }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('t');
  await expect(page.getByRole('dialog')).toContainText('Circuit complete!');
});
