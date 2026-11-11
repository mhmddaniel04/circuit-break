import { expect, test } from '@playwright/test';
import { muteGame, passAllLessons, unlockUpTo } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('a new player reads the lesson, passes the quick check and opens level 1 @mobile', async ({
  page,
}) => {
  await page.goto('/worlds');
  await expect(page.getByRole('link', { name: /flip the switch/i })).toHaveCount(0);
  await page
    .getByRole('link', { name: /start the lesson/i })
    .first()
    .click();

  // Read every step of the lesson.
  await expect(page.getByRole('heading', { name: 'Signal Basics' })).toBeVisible();
  await page.getByRole('button', { name: /^next/i }).click();
  // Step 2: flip the switch of the live NOT circuit.
  await page.getByRole('switch', { name: /input A/i }).click();
  await expect(page.getByText('Output = 0')).toBeVisible();
  await page.getByRole('button', { name: /^next/i }).click();
  // Step 3: predict the output, then fill in the truth table.
  await page
    .getByRole('region', { name: /predict first/i })
    .getByRole('button', { name: '0' })
    .click();
  await expect(page.getByText('Correct!')).toBeVisible();
  await page.getByRole('button', { name: /output for A = 0/i }).click();
  await page.getByRole('button', { name: /output for A = 0/i }).click();
  await page.getByRole('button', { name: /output for A = 1/i }).click();
  await page.getByRole('button', { name: /check my table/i }).click();
  await expect(page.getByText(/every row is correct/i)).toBeVisible();
  await page.getByRole('button', { name: /^next/i }).click();
  await page.getByRole('button', { name: /start the quick check/i }).click();

  // Quick check: one wrong answer is still a pass (2 of 3).
  await page.getByRole('button', { name: '1', exact: true }).click(); // NOT 1 → 0, so this is wrong
  await expect(page.getByText('Not quite.')).toBeVisible();
  await page.getByRole('button', { name: /next question/i }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: /next question/i }).click();
  await page.getByRole('button', { name: '4', exact: true }).click();
  await page.getByRole('button', { name: /see my result/i }).click();
  await expect(page.getByText('Lesson complete!')).toBeVisible();

  await page.getByRole('button', { name: /play the first level/i }).click();
  await expect(page.getByRole('heading', { name: 'Flip the Switch' })).toBeVisible();
});

test('a player solves level 1, earns 3 stars and unlocks level 2 @mobile', async ({ page }) => {
  await passAllLessons(page);
  await page.goto('/worlds');
  await page.getByRole('link', { name: /flip the switch/i }).click();

  await page.getByRole('toolbar').getByRole('button', { name: /^NOT/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Circuit complete!');
  await expect(dialog.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();

  await dialog.getByRole('button', { name: /world map/i }).click();
  await expect(page.getByRole('link', { name: /wake up/i })).toBeVisible();

  // Progress survives a page refresh.
  await page.reload();
  await expect(page.getByText('★ 3 /')).toBeVisible();
});

test('a wrong circuit shows which cases fail', async ({ page }) => {
  await unlockUpTo(page, 'w2-l1');
  await page.goto('/level/w2-l1');
  await page.getByRole('toolbar').getByRole('button', { name: /^OR/ }).click();
  await page.getByRole('button', { name: /^Slot s1,/ }).click();
  await page.getByRole('button', { name: /test circuit/i }).click();

  await expect(page.getByRole('status')).toContainText('Not quite');
  await expect(page.getByRole('img', { name: /bulb Y is wrong/i })).toBeVisible();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(5);
});

test('the whole level can be played with the keyboard only', async ({ page }) => {
  await passAllLessons(page);
  await page.goto('/level/w1-l1');
  await expect(page.getByRole('heading', { name: 'Flip the Switch' })).toBeVisible();
  await page.keyboard.press('1');
  await expect(page.getByRole('status')).toContainText('place the NOT gate');
  await page.getByRole('button', { name: /^Slot s1,/ }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('t');
  await expect(page.getByRole('dialog')).toContainText('Circuit complete!');
});
