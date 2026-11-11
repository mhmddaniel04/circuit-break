import { findSolutions } from '@/features/simulation';
import { levelSchema } from '@/levels/schema';
import { buildDailyLevel, todayKey } from '../dailyLevel';

/** 200 days in a row, starting on 1 January 2027. */
const days = Array.from({ length: 200 }, (_, i) => todayKey(new Date(2027, 0, 1 + i)));

describe('todayKey', () => {
  it('writes the local date as YYYY-MM-DD', () => {
    expect(todayKey(new Date(2026, 10, 5))).toBe('2026-11-05');
  });
});

describe('buildDailyLevel', () => {
  it('gives every player the same puzzle on the same day', () => {
    expect(buildDailyLevel('2026-11-11')).toEqual(buildDailyLevel('2026-11-11'));
  });

  it('gives a different puzzle on most days', () => {
    const puzzles = new Set(days.map((day) => buildDailyLevel(day).concept.en));
    expect(puzzles.size).toBeGreaterThan(20);
  });

  it.each(days.slice(0, 60))('makes a valid, solvable level for %s', (day) => {
    const level = buildDailyLevel(day);
    // The daily level belongs to no district, so give it a pretend id and world for the check.
    const result = levelSchema.safeParse({ ...level, id: 'w9-l1', world: 9 });
    expect(result.error?.issues ?? []).toEqual([]);
    expect(findSolutions(level, level.toolbox).length).toBeGreaterThan(0);
  });

  it.each(days)('never puts a gate on a row that another wire passes along (%s)', (day) => {
    const level = buildDailyLevel(day);
    const pos = new Map(
      [...level.sources, ...level.slots, ...level.bulbs].map((node) => [node.id, node.pos]),
    );
    for (const wire of level.wires) {
      const [fromCol, fromRow] = pos.get(wire.from)!;
      const [toCol] = pos.get(wire.to)!;
      // The wire leaves at its own row: no other gate may sit on that row before it turns.
      const blocking = level.slots.filter(
        (slot) =>
          slot.id !== wire.to &&
          slot.pos[1] === fromRow &&
          slot.pos[0] > fromCol &&
          slot.pos[0] < toCol - 1,
      );
      expect(blocking).toEqual([]);
    }
  });

  it('tests all 8 rows of the truth table with a bulb that turns on and off', () => {
    const level = buildDailyLevel('2026-11-11');
    expect(level.cases).toHaveLength(8);
    const targets = new Set(level.cases!.map((testCase) => testCase.targets.Y));
    expect(targets).toEqual(new Set([0, 1]));
  });
});
