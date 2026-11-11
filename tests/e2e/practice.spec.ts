import { expect, test } from '@playwright/test';
import { muteGame } from './helpers';

test.beforeEach(async ({ page }) => muteGame(page));

test('a student practises SPM questions from the Learn page @mobile', async ({ page }) => {
  await page.goto('/learn');
  await page.getByRole('link', { name: /spm practice/i }).click();
  await expect(page.getByRole('heading', { name: 'SPM Practice' })).toBeVisible();
  await expect(page.getByRole('img', { name: /logic circuit/i })).toBeVisible();

  await page.getByRole('button', { name: /show answer/i }).click();
  await expect(page.getByRole('heading', { name: /worked answer/i })).toBeVisible();

  await page.getByRole('button', { name: /new question/i }).click();
  await expect(page.getByText('Question 2')).toBeVisible();
  await page.getByRole('button', { name: 'Hard' }).click();
  await expect(page.getByRole('row')).toHaveCount(9);
});

test('the cheat sheet fits on one printed A4 page', async ({ page }) => {
  await page.goto('/cheatsheet');
  await expect(page.getByRole('heading', { name: /cheat sheet/i })).toBeVisible();
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  // Count the pages in the PDF file.
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? [];
  expect(pages).toHaveLength(1);
});
