import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

// Automatic accessibility check (WCAG 2.1 A and AA) on every page.
const PAGES = ['/', '/worlds', '/level/w1-l1', '/learn', '/settings'];

for (const path of PAGES) {
  test(`${path} has no accessibility problems`, async ({ page }) => {
    await muteGame(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}
