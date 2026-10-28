import { findSolutions } from '@/features/simulation';
import { getInitialPlacement, getLevel, getLevelsByWorld, getNextLevel, LEVELS } from '../index';
import { levelSchema } from '../schema';

const validLevel = getLevel('w1-l1')!;

/** Levels designed to have more than one correct answer. */
const MULTIPLE_ANSWERS: Record<string, number> = {
  'w4-l7': 2, // Majority vote: swapping every AND and OR also works.
};

describe('level files', () => {
  it('loads all 30 levels, sorted by world and order', () => {
    expect(LEVELS).toHaveLength(30);
    const keys = LEVELS.map((level) => level.world * 1000 + level.order);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
  });

  it('has no duplicate level ids', () => {
    const ids = LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every level an id that matches its world and order', () => {
    for (const level of LEVELS) {
      expect(level.id).toBe(`w${level.world}-l${level.order}`);
    }
  });

  it.each(LEVELS)('$id can be solved with its toolbox', (level) => {
    expect(findSolutions(level, level.toolbox)).toHaveLength(MULTIPLE_ANSWERS[level.id] ?? 1);
  });

  it('has levels in all 5 worlds', () => {
    for (const world of [1, 2, 3, 4, 5]) {
      expect(getLevelsByWorld(world).length).toBeGreaterThan(0);
    }
  });

  it('finds a level by id, and the level after it', () => {
    expect(getLevel('w1-l1')?.title.en).toBe('Flip the Switch');
    expect(getLevel('nope')).toBeUndefined();
    expect(getNextLevel('w1-l1')?.id).toBe('w1-l2');
    expect(getNextLevel(LEVELS[LEVELS.length - 1].id)).toBeUndefined();
  });
});

describe('levelSchema', () => {
  it('accepts a valid level', () => {
    expect(levelSchema.safeParse(validLevel).success).toBe(true);
  });

  it('rejects a wire to an unknown node', () => {
    const level = { ...validLevel, wires: [...validLevel.wires, { from: 'A', to: 'ghost' }] };
    expect(levelSchema.safeParse(level).success).toBe(false);
  });

  it('rejects a node outside the grid', () => {
    const level = { ...validLevel, grid: { cols: 2, rows: 2 } };
    expect(levelSchema.safeParse(level).success).toBe(false);
  });

  it('rejects a toolbox with too few gates', () => {
    const level = { ...validLevel, toolbox: [] };
    expect(levelSchema.safeParse(level).success).toBe(false);
  });

  it('rejects a bad level id', () => {
    const level = { ...validLevel, id: 'level-one' };
    expect(levelSchema.safeParse(level).success).toBe(false);
  });
});

describe('getInitialPlacement', () => {
  it('returns the gates that start on the board (repair levels)', () => {
    expect(getInitialPlacement(getLevel('w4-l1')!)).toEqual({ s1: 'OR' });
    expect(getInitialPlacement(validLevel)).toEqual({});
  });
});
