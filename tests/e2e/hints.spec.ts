import { expect, test } from '@playwright/test';
import { muteGame, passAllLessons } from './helpers';

test.beforeEach(async ({ page }) => {
  await muteGame(page);
  await passAllLessons(page);
});

test('Bit sells up to 3 AI hints for coins, without taking stars away', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/hint', async (route) => {
    calls += 1;
    const { hintLevel } = route.request().postDataJSON() as { hintLevel: number };
    await route.fulfill({ json: { hint: `AI hint number ${hintLevel}` } });
  });

  await page.goto('/level/w1-l1');
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await expect(page.getByText(/costs 5 coins\. you have 30/i)).toBeVisible();
  await page.getByRole('button', { name: /buy hint · 5 coins/i }).click();
  await expect(page.getByText('AI hint number 1')).toBeVisible();

  await page.getByRole('button', { name: /another hint · 10 coins/i }).click();
  await expect(page.getByText('AI hint number 2')).toBeVisible();
  await page.getByRole('button', { name: /another hint · 15 coins/i }).click();
  await expect(page.getByText('AI hint number 3')).toBeVisible();
  await expect(page.getByText(/that's all my hints/i)).toBeVisible();
  expect(calls).toBe(3);

  await page.getByRole('toolbar').getByRole('button', { name: /^NOT/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
});

test('without the AI service, Bit shows the written hint', async ({ page }) => {
  await page.route('**/api/hint', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  );
  await page.goto('/level/w1-l1');
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await page.getByRole('button', { name: /buy hint/i }).click();
  await expect(page.getByText(/which gate turns 1 into 0/i)).toBeVisible();
  await expect(page.getByText('(offline hint)')).toBeVisible();
});
