import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('Bit gives up to 3 AI hints, and a hint limits the result to 1 star', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/hint', async (route) => {
    calls += 1;
    const { hintLevel } = route.request().postDataJSON() as { hintLevel: number };
    await route.fulfill({ json: { hint: `AI hint number ${hintLevel}` } });
  });

  await page.goto('/level/w1-l1');
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await page.getByRole('button', { name: 'Show hint' }).click();
  await expect(page.getByText('AI hint number 1')).toBeVisible();

  await page.getByRole('button', { name: /another hint \(1\/3\)/i }).click();
  await expect(page.getByText('AI hint number 2')).toBeVisible();
  await page.getByRole('button', { name: /another hint \(2\/3\)/i }).click();
  await expect(page.getByText('AI hint number 3')).toBeVisible();
  await expect(page.getByText(/that's all my hints/i)).toBeVisible();
  expect(calls).toBe(3);

  await page.getByRole('toolbar').getByRole('button', { name: /^NOT/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();
  await expect(page.getByRole('img', { name: '1 of 3 stars' })).toBeVisible();
});

test('without the AI service, Bit shows the written hint', async ({ page }) => {
  await page.route('**/api/hint', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  );
  await page.goto('/level/w1-l1');
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await page.getByRole('button', { name: 'Show hint' }).click();
  await expect(page.getByText(/which gate turns 1 into 0/i)).toBeVisible();
  await expect(page.getByText('(offline hint)')).toBeVisible();
});
