import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('a student asks Bit a question from a lesson @mobile', async ({ page }) => {
  let aiCalls = 0;
  await page.route('**/api/chat', async (route) => {
    aiCalls += 1;
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

  // A common question is answered instantly from Bit's answer bank.
  await page.getByRole('button', { name: /real-life example of AND/i }).click();
  await expect(page.getByText(/press the start button AND/i)).toBeVisible();
  await expect(page.getByText('⚡ Instant answer')).toBeVisible();

  // A new question goes to the AI.
  const question = 'Can a computer remember things with flip-flops?';
  await page.getByRole('textbox', { name: /ask a question/i }).fill(question);
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText(`World 2: you asked "${question}".`)).toBeVisible();
  expect(aiCalls).toBe(1);
});

test('Bit explains when it cannot answer', async ({ page }) => {
  await page.route('**/api/chat', (route) =>
    route.fulfill({ status: 503, json: { error: 'not_configured' } }),
  );
  await page.goto('/learn');
  await page.getByRole('button', { name: 'Ask Bit' }).click();
  await page.getByRole('textbox', { name: /ask a question/i }).fill('What is a flip-flop?');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('alert')).toContainText(/can't answer right now/i);
});
