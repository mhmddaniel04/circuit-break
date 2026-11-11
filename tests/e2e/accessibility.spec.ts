import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { muteGame, passAllLessons } from './helpers';

// Automatic accessibility check (WCAG 2.1 A and AA) on every page.
const PAGES = ['/', '/worlds', '/lesson/1', '/level/w1-l1', '/learn', '/settings'];

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
  for (let step = 0; step < 3; step += 1) {
    await page.getByRole('button', { name: /^next|start the quick check/i }).click();
  }
  await page.getByRole('button', { name: '1', exact: true }).click();
  await page.waitForTimeout(300);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});
