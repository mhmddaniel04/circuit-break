import { getLevel, LEVELS } from '@/levels';
import { useProgressStore } from '../progressStore';
import { countStars, getLevelLock, isLessonDone, isLevelUnlocked, mergeRecord } from '../records';

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

describe('isLessonDone', () => {
  it('is done once the quiz is passed', () => {
    expect(isLessonDone(1, {}, {}, LEVELS)).toBe(false);
    expect(isLessonDone(1, { 1: true }, {}, LEVELS)).toBe(true);
  });

  it('counts as done for players who already finished a level in that world', () => {
    const records = { 'w2-l1': { stars: 2 as const, bestScore: 800, bestSeconds: 20 } };
    expect(isLessonDone(2, {}, records, LEVELS)).toBe(true);
    expect(isLessonDone(3, {}, records, LEVELS)).toBe(false);
  });
});

describe('isLevelUnlocked', () => {
  const [first, second] = LEVELS;
  const done = { stars: 1 as const, bestScore: 100, bestSeconds: 10 };

  it('locks the first level until the World 1 lesson is passed', () => {
    expect(getLevelLock(first.id, {}, {}, LEVELS)).toBe('lesson');
    expect(isLevelUnlocked(first.id, {}, { 1: true }, LEVELS)).toBe(true);
  });

  it('locks a level until the one before it is completed', () => {
    expect(getLevelLock(second.id, {}, { 1: true }, LEVELS)).toBe('previous');
    expect(isLevelUnlocked(second.id, { [first.id]: done }, { 1: true }, LEVELS)).toBe(true);
  });

  it('locks the first level of a new world until its lesson is passed', () => {
    const worldOne = Object.fromEntries(
      LEVELS.filter((level) => level.world === 1).map((level) => [level.id, done]),
    );
    expect(getLevelLock('w2-l1', worldOne, {}, LEVELS)).toBe('lesson');
    expect(getLevelLock('w2-l1', worldOne, { 2: true }, LEVELS)).toBeNull();
  });

  it('treats unknown levels as locked', () => {
    expect(isLevelUnlocked('w9-l9', {}, { 1: true }, LEVELS)).toBe(false);
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
    useProgressStore.setState({ levels: {}, lessons: {} });
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

  it('saves passed lessons', () => {
    useProgressStore.getState().completeLesson(3);
    expect(useProgressStore.getState().lessons).toEqual({ 3: true });
    expect(JSON.parse(localStorage.getItem('cb.progress')!).state.lessons).toEqual({ 3: true });
  });

  it('can reset all progress', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 1, score: 500, seconds: 60 });
    useProgressStore.getState().completeLesson(1);
    useProgressStore.getState().resetProgress();
    expect(useProgressStore.getState().levels).toEqual({});
    expect(useProgressStore.getState().lessons).toEqual({});
  });

  it('has the levels used in these tests', () => {
    expect(getLevel('w1-l1')).toBeDefined();
    expect(getLevel('w2-l1')).toBeDefined();
  });
});
