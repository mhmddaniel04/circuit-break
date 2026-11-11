import type { Page } from '@playwright/test';
import { findSolutions, type Placement } from '../../src/features/simulation';
import world1 from '../../src/levels/data/world1.json' with { type: 'json' };
import world2 from '../../src/levels/data/world2.json' with { type: 'json' };
import world3 from '../../src/levels/data/world3.json' with { type: 'json' };
import world4 from '../../src/levels/data/world4.json' with { type: 'json' };
import world5 from '../../src/levels/data/world5.json' with { type: 'json' };

/** The level files, as plain data (the e2e tests don't run through Vite). */
export type LevelData = (typeof world1)[number] & {
  slots: { id: string; pos: number[]; fixedGate?: string; initialGate?: string }[];
};

export const LEVELS = [...world1, ...world2, ...world3, ...world4, ...world5] as LevelData[];

export function solutionFor(level: LevelData): Placement {
  // The JSON is checked by the app's own tests; here it only needs to look like a circuit.
  const [solution] = findSolutions(level as never, level.toolbox as never);
  if (!solution) throw new Error(`No solution for ${level.id}`);
  return solution;
}

/** Every world's lesson marked as passed. */
const ALL_LESSONS = { 1: true, 2: true, 3: true, 4: true, 5: true };

/** Saves progress in the browser, as if the player had already played. */
async function saveProgress(page: Page, levels: Record<string, unknown>): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    (state) => localStorage.setItem('cb.progress', JSON.stringify({ state, version: 1 })),
    { levels, lessons: ALL_LESSONS },
  );
}

/** Passes every lesson and finishes every level before `levelId`, so it is unlocked. */
export async function unlockUpTo(page: Page, levelId: string): Promise<void> {
  const index = LEVELS.findIndex((level) => level.id === levelId);
  const levels = Object.fromEntries(
    LEVELS.slice(0, index).map((level) => [
      level.id,
      { stars: 1, bestScore: 100, bestSeconds: 99 },
    ]),
  );
  await saveProgress(page, levels);
}

/** Passes every lesson, so the first level of each world only needs the level before it. */
export async function passAllLessons(page: Page): Promise<void> {
  await saveProgress(page, {});
}

/** Turns sound off so the tests run quietly. */
export async function muteGame(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem(
      'cb.settings',
      JSON.stringify({ state: { sound: false, colorBlind: false }, version: 1 }),
    ),
  );
}

const toolboxButton = (page: Page, gate: string) =>
  page.getByRole('toolbar').getByRole('button', { name: new RegExp(`^${gate}\\b`) });

const slotButton = (page: Page, slotId: string) =>
  page.getByRole('button', { name: new RegExp(`^Slot ${slotId},`) });

/** Clears any gate selection in the toolbox. */
async function unselectAll(page: Page): Promise<void> {
  const selected = page.getByRole('toolbar').locator('button[aria-pressed="true"]');
  if (await selected.count()) await selected.first().click();
}

/** Places the solution of a level on the board by clicking, like a student would. */
export async function placeSolution(page: Page, level: LevelData): Promise<void> {
  const solution = solutionFor(level);

  // Repair levels: remove wrong starting gates first, so their gates go back to the toolbox.
  for (const slot of level.slots) {
    if (slot.initialGate && solution[slot.id] !== slot.initialGate) {
      await unselectAll(page);
      await slotButton(page, slot.id).click();
    }
  }

  for (const slot of level.slots) {
    const gate = solution[slot.id];
    if (!gate || slot.fixedGate || slot.initialGate === gate) continue;
    const button = toolboxButton(page, gate);
    if ((await button.getAttribute('aria-pressed')) !== 'true') await button.click();
    await slotButton(page, slot.id).click();
  }
}
