import { expect, test } from '@playwright/test';
import { muteGame, passAllLessons } from './helpers';

test.beforeEach(async ({ page }) => {
  await muteGame(page);
  await passAllLessons(page);
});

test('hints 1 and 2 are instant, hint 3 comes from Bit, and they cost coins not stars', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/hint', async (route) => {
    calls += 1;
    const { hintLevel, focus } = route.request().postDataJSON() as {
      hintLevel: number;
      focus?: string;
    };
    await route.fulfill({ json: { hint: `AI hint ${hintLevel} about ${focus}` } });
  });

  await page.goto('/level/w1-l1');
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await expect(page.getByText(/costs 5 coins\. you have 30/i)).toBeVisible();
  await page.getByRole('button', { name: /buy hint · 5 coins/i }).click();
  await expect(page.getByText(/which gate turns 1 into 0/i)).toBeVisible();

  await page.getByRole('button', { name: /another hint · 10 coins/i }).click();
  await expect(page.getByText(/look at the glowing slot/i)).toBeVisible();
  expect(calls).toBe(0);

  await page.getByRole('button', { name: /another hint · 15 coins/i }).click();
  await expect(page.getByText('AI hint 3 about s1')).toBeVisible();
  await expect(page.getByText(/that's all my hints/i)).toBeVisible();
  expect(calls).toBe(1);

  await page.getByRole('toolbar').getByRole('button', { name: /^NOT/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
});

test("without the AI service, Bit still gives every hint from the game's own answers", async ({
  page,
}) => {
  await page.route('**/api/hint', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  );
  await page.goto('/level/w1-l1');
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await page.getByRole('button', { name: /buy hint/i }).click();
  await page.getByRole('button', { name: /another hint · 10/i }).click();
  await page.getByRole('button', { name: /another hint · 15/i }).click();
  await expect(page.getByText(/put the NOT gate in the glowing slot/i)).toBeVisible();
});

test('a hint never hangs: a silent AI falls back after the time limit', async ({ page }) => {
  // The AI never answers. The game must give up and show its own hint.
  await page.route('**/api/hint', () => new Promise(() => {}));
  await page.goto('/level/w1-l1');
  await page.clock.install();
  await page.getByRole('button', { name: /^💡 Hint/ }).click();
  await page.getByRole('button', { name: /buy hint/i }).click();
  await page.getByRole('button', { name: /another hint · 10/i }).click();
  await page.getByRole('button', { name: /another hint · 15/i }).click();
  await expect(page.getByText(/bit is thinking/i)).toBeVisible();
  await page.clock.fastForward(11_000);
  await expect(page.getByText(/put the NOT gate in the glowing slot/i)).toBeVisible();
});
