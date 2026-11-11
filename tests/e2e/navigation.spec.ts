import { expect, test } from '@playwright/test';
import { muteGame, passAllLessons } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('home page links to every section @mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /circuit break/i })).toBeVisible();

  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('heading', { name: 'Power Grid City' })).toBeVisible();
  await page.getByRole('button', { name: /home/i }).click();

  await page.getByRole('button', { name: 'Learn Gates' }).click();
  await expect(page.getByRole('heading', { name: 'Learn the Gates' })).toBeVisible();
  await page.getByRole('button', { name: /home/i }).click();

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});

test('switches to Bahasa Melayu and remembers it @mobile', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch language/i }).click();
  await expect(page.getByRole('button', { name: 'Main' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Main' })).toBeVisible();
});

test('a level page can be opened directly and refreshed', async ({ page }) => {
  await passAllLessons(page);
  await page.goto('/level/w1-l1');
  await expect(page.getByRole('heading', { name: 'Flip the Switch' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Flip the Switch' })).toBeVisible();
});

test('locked levels cannot be opened', async ({ page }) => {
  await passAllLessons(page);
  await page.goto('/level/w5-l7');
  await expect(page.getByText(/this level is locked/i)).toBeVisible();
});

test('a level cannot be played before its lesson', async ({ page }) => {
  await page.goto('/level/w1-l1');
  await expect(page.getByText(/read the district 1 lesson first/i)).toBeVisible();
  await page.getByRole('link', { name: /open the lesson/i }).click();
  await expect(page.getByRole('heading', { name: 'Signal Basics' })).toBeVisible();
});
