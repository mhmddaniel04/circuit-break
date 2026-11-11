import { expect, test } from '@playwright/test';
import { LEVELS, muteGame, placeSolution, unlockUpTo } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('a student defeats the District 1 boss by fixing circuits fast @mobile', async ({ page }) => {
  await unlockUpTo(page, 'w1-l5');
  await page.goto('/level/w1-l5');
  await expect(page.getByRole('heading', { name: /flicker is attacking the city/i })).toBeVisible();
  await page.getByRole('button', { name: /fight/i }).click();

  // The rounds are District 1's last three levels, then the boss level itself.
  const rounds = ['w1-l2', 'w1-l3', 'w1-l4', 'w1-l5'].map((id) => LEVELS.find((l) => l.id === id)!);
  for (const level of rounds) {
    if (await page.getByRole('dialog').isVisible()) break;
    await expect(page.getByText(level.title.en, { exact: true })).toBeVisible();
    await placeSolution(page, level);
    await page.getByRole('button', { name: /attack/i }).click();
    await page.waitForTimeout(1500);
  }

  await expect(page.getByRole('dialog')).toContainText(/flicker defeated/i);
  await expect(page.getByRole('dialog')).toContainText(/boss defeated! \+50 XP/i);
});

test('the boss battle page has no accessibility problems', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  await unlockUpTo(page, 'w4-l7');
  await page.goto('/level/w4-l7');
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  await page.getByRole('button', { name: /fight/i }).click();
  await page.waitForTimeout(500);
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});
