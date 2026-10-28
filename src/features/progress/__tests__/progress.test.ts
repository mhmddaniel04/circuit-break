import { getLevel, LEVELS } from '@/levels';
import { useProgressStore } from '../progressStore';
import { countStars, isLevelUnlocked, mergeRecord } from '../records';

describe('mergeRecord', () => {
  it('creates a record from the first result', () => {
    expect(mergeRecord(undefined, { stars: 2, score: 800, seconds: 40 })).toEqual({
      stars: 2,
      bestScore: 800,
      bestSeconds: 40,
    });
  });

  it('keeps the best stars, score and time', () => {
    const previous = { stars: 3 as const, bestScore: 900, bestSeconds: 50 };
    expect(mergeRecord(previous, { stars: 1, score: 1100, seconds: 20 })).toEqual({
      stars: 3,
      bestScore: 1100,
      bestSeconds: 20,
    });
  });
});

describe('isLevelUnlocked', () => {
  const [first, second] = LEVELS;

  it('always unlocks the first level', () => {
    expect(isLevelUnlocked(first.id, {}, LEVELS)).toBe(true);
  });

  it('locks a level until the one before it is completed', () => {
    expect(isLevelUnlocked(second.id, {}, LEVELS)).toBe(false);
    const records = { [first.id]: { stars: 1 as const, bestScore: 100, bestSeconds: 10 } };
    expect(isLevelUnlocked(second.id, records, LEVELS)).toBe(true);
  });

  it('treats unknown levels as locked', () => {
    expect(isLevelUnlocked('w9-l9', {}, LEVELS)).toBe(false);
  });
});

describe('countStars', () => {
  it('adds up the stars of every level', () => {
    const records = {
      'w1-l1': { stars: 3 as const, bestScore: 1000, bestSeconds: 10 },
      'w2-l1': { stars: 2 as const, bestScore: 800, bestSeconds: 20 },
    };
    expect(countStars(records, LEVELS)).toBe(5);
  });
});

describe('useProgressStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {} });
  });

  it('saves a result and reports a new best score', () => {
    const { recordResult } = useProgressStore.getState();
    expect(recordResult('w1-l1', { stars: 2, score: 800, seconds: 30 })).toBe(true);
    expect(recordResult('w1-l1', { stars: 3, score: 700, seconds: 25 })).toBe(false);
    expect(useProgressStore.getState().levels['w1-l1']).toEqual({
      stars: 3,
      bestScore: 800,
      bestSeconds: 25,
    });
  });

  it('writes the progress to localStorage', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 1, score: 500, seconds: 60 });
    expect(localStorage.getItem('cb.progress')).toContain('w1-l1');
  });

  it('can reset all progress', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 1, score: 500, seconds: 60 });
    useProgressStore.getState().resetProgress();
    expect(useProgressStore.getState().levels).toEqual({});
  });

  it('has the levels used in these tests', () => {
    expect(getLevel('w1-l1')).toBeDefined();
    expect(getLevel('w2-l1')).toBeDefined();
  });
});
