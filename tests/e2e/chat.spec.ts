import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('a student asks Bit a question from a lesson @mobile', async ({ page }) => {
  await page.route('**/api/chat', async (route) => {
    const { world, messages } = route.request().postDataJSON() as {
      world: number;
      messages: { text: string }[];
    };
    await route.fulfill({
      contentType: 'text/plain',
      body: `World ${world}: you asked "${messages[messages.length - 1].text}".`,
    });
  });

  await page.goto('/lesson/2');
  await page.getByRole('button', { name: 'Ask Bit' }).click();
  await page.getByRole('button', { name: /real-life example of AND/i }).click();
  await expect(
    page.getByText('World 2: you asked "Give me a real-life example of AND".'),
  ).toBeVisible();

  await page.getByRole('textbox', { name: /ask a question/i }).fill('What is 1 + 1?');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('World 2: you asked "What is 1 + 1?".')).toBeVisible();
});

test('Bit explains when it cannot answer', async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  );
  await page.goto('/learn');
  await page.getByRole('button', { name: 'Ask Bit' }).click();
  await page.getByRole('button', { name: /difference between OR and XOR/i }).click();
  await expect(page.getByRole('alert')).toContainText(/can't answer right now/i);
});
