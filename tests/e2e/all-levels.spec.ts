import { expect, test } from '@playwright/test';
import { LEVELS, muteGame, placeSolution, unlockUpTo } from './helpers';

// Proves that every one of the 30 levels can be finished through the real user interface.
for (const level of LEVELS) {
  test(`${level.id} "${level.title.en}" can be solved by clicking`, async ({ page }) => {
    await muteGame(page);
    await unlockUpTo(page, level.id);
    await page.goto(`/level/${level.id}`);
    await expect(page.getByRole('heading', { name: level.title.en })).toBeVisible();

    await placeSolution(page, level);
    await page.getByRole('button', { name: /test circuit/i }).click();

    await expect(page.getByRole('dialog')).toContainText('Circuit complete!');
  });
}
