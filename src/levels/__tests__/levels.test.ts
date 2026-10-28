import { findSolutions } from '@/features/simulation';
import { getInitialPlacement, getLevel, LEVELS } from '../index';
import { levelSchema } from '../schema';
import validLevel from '../world1/w1-l1.json';

describe('level files', () => {
  it('loads every level, sorted by world and order', () => {
    expect(LEVELS.length).toBeGreaterThan(0);
    const keys = LEVELS.map((level) => level.world * 1000 + level.order);
    expect(keys).toEqual([...keys].sort((a, b) => a - b));
  });

  it('has no duplicate level ids', () => {
    const ids = LEVELS.map((level) => level.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LEVELS)('$id can be solved with its toolbox', (level) => {
    expect(findSolutions(level, level.toolbox, 1)).toHaveLength(1);
  });

  it('finds a level by id', () => {
    expect(getLevel('w1-l1')?.title.en).toBe('Flip the Switch');
    expect(getLevel('nope')).toBeUndefined();
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
  it('returns the gates that start on the board', () => {
    const level = levelSchema.parse({
      ...validLevel,
      slots: [{ id: 's1', pos: [2, 1], initialGate: 'AND' }],
      toolbox: [{ gate: 'NOT', count: 1 }],
    });
    expect(getInitialPlacement(level)).toEqual({ s1: 'AND' });
  });
});
