import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { muteGame, passAllLessons, unlockUpTo } from './helpers';

// Automatic accessibility check (WCAG 2.1 A and AA) on every page.
const PAGES = [
  '/',
  '/worlds',
  '/lesson/1',
  '/level/w1-l1',
  '/learn',
  '/practice',
  '/cheatsheet',
  '/achievements',
  '/daily',
  '/settings',
];

for (const path of PAGES) {
  test(`${path} has no accessibility problems`, async ({ page }) => {
    await muteGame(page);
    await passAllLessons(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}

test('the lesson quick check has no accessibility problems after answering', async ({ page }) => {
  await muteGame(page);
  await page.goto('/lesson/5');
  for (let step = 0; step < 4; step += 1) {
    await page.getByRole('button', { name: /^next|start the quick check/i }).click();
  }
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});

test('the Ask Bit chat has no accessibility problems', async ({ page }) => {
  await muteGame(page);
  await page.route('**/api/chat', (route) =>
    route.fulfill({ contentType: 'text/plain', body: 'AND gives 1 only when both inputs are 1.' }),
  );
  await page.goto('/lesson/2');
  await page.getByRole('button', { name: 'Ask Bit' }).click();
  await page.getByRole('button', { name: /real-life example of AND/i }).click();
  await expect(page.getByText('AND gives 1 only when both inputs are 1.')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});

test('the interactive lesson blocks have no accessibility problems after use', async ({ page }) => {
  await muteGame(page);
  await page.goto('/lesson/2');
  await page.getByRole('switch', { name: /input A/i }).click();
  await page.getByRole('button', { name: /^next/i }).click();
  await page.getByRole('button', { name: /^next/i }).click();
  await page
    .getByRole('region', { name: /predict first/i })
    .first()
    .getByRole('button', { name: '1' })
    .click();
  for (const name of [/A = 0, B = 0/, /A = 0, B = 1/, /A = 1, B = 0/, /A = 1, B = 1/]) {
    await page.getByRole('button', { name: new RegExp(`output for ${name.source}`, 'i') }).click();
  }
  await page.getByRole('button', { name: /check my table/i }).click();
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});

test('a truth-table level has no accessibility problems after a wrong test', async ({ page }) => {
  await muteGame(page);
  await unlockUpTo(page, 'w2-l3');
  await page.goto('/level/w2-l3');
  await page.getByRole('toolbar').getByRole('button', { name: /^OR/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /^Slot s2,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});
