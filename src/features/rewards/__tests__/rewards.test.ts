import { useProgressStore } from '@/features/progress';
import { getLevelsByWorld } from '@/levels';
import { ACHIEVEMENTS, EMPTY_STATS, newlyEarned } from '../achievements';
import {
  rewardChatQuestion,
  rewardLessonPassed,
  rewardLevelSolved,
  rewardPracticeSolved,
  usePlayerStore,
} from '../playerStore';
import { getRank } from '../ranks';
import { levelReward, START_COINS } from '../rewards';

const done = { stars: 3 as const, bestScore: 1000, bestSeconds: 10 };

describe('getRank', () => {
  it('starts as a Trainee and moves up with XP', () => {
    expect(getRank(0)).toMatchObject({ id: 'trainee', level: 1, nextXp: 300, progress: 0 });
    expect(getRank(450)).toMatchObject({ id: 'apprentice', level: 2, nextXp: 800 });
    expect(getRank(450).progress).toBeCloseTo(0.3);
  });

  it('stops at Chief Engineer', () => {
    expect(getRank(99_999)).toMatchObject({ id: 'chief', level: 6, nextXp: null, progress: 1 });
  });
});

describe('levelReward', () => {
  it('rewards a level the first time it is solved', () => {
    expect(levelReward(undefined, 3)).toEqual({ xp: 125, coins: 15 });
    expect(levelReward(undefined, 1)).toEqual({ xp: 75, coins: 5 });
  });

  it('only rewards extra stars on a replay', () => {
    expect(levelReward({ ...done, stars: 1 }, 3)).toEqual({ xp: 50, coins: 10 });
    expect(levelReward(done, 3)).toEqual({ xp: 0, coins: 0 });
  });
});

describe('achievements', () => {
  it('has a unique id for every badge', () => {
    const ids = ACHIEVEMENTS.map((achievement) => achievement.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('finds badges that are earned but not yet unlocked', () => {
    const records = Object.fromEntries(getLevelsByWorld(1).map((level) => [level.id, done]));
    const context = { records, lessons: {}, stats: EMPTY_STATS };
    expect(newlyEarned(context, {}).map((a) => a.id)).toEqual([
      'firstLight',
      'perfectionist',
      'poweredUp',
    ]);
    expect(newlyEarned(context, { firstLight: 'yesterday' }).map((a) => a.id)).not.toContain(
      'firstLight',
    );
  });
});

describe('usePlayerStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {}, lessons: {} });
    usePlayerStore.getState().resetPlayer();
  });

  it('starts with some coins for hints', () => {
    expect(usePlayerStore.getState().coins).toBe(START_COINS);
  });

  it('spends coins only when there are enough', () => {
    const { spendCoins } = usePlayerStore.getState();
    expect(spendCoins(10)).toBe(true);
    expect(usePlayerStore.getState().coins).toBe(START_COINS - 10);
    expect(spendCoins(999)).toBe(false);
    expect(usePlayerStore.getState().coins).toBe(START_COINS - 10);
  });

  it('rewards a solved level and unlocks badges with their own reward', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 3, score: 1000, seconds: 8 });
    const result = rewardLevelSolved({
      levelId: 'w1-l1',
      previous: undefined,
      stars: 3,
      attempts: 1,
      seconds: 8,
      parSeconds: 30,
      hintsBought: 0,
    });
    expect(result.achievements.map((a) => a.id)).toEqual(['firstLight']);
    expect(result).toMatchObject({ xp: 175, coins: 40, rankUp: null });
    const { stats, unlocked } = usePlayerStore.getState();
    expect(stats.noHintLevels).toEqual(['w1-l1']);
    expect(stats.underParLevels).toEqual(['w1-l1']);
    expect(unlocked.firstLight).toBeDefined();
  });

  it('remembers a comeback after 3 wrong tests', () => {
    useProgressStore.getState().recordResult('w1-l1', { stars: 1, score: 100, seconds: 99 });
    rewardLevelSolved({
      levelId: 'w1-l1',
      previous: undefined,
      stars: 1,
      attempts: 4,
      seconds: 99,
      parSeconds: 30,
      hintsBought: 1,
    });
    expect(usePlayerStore.getState().stats).toMatchObject({ comeback: true, noHintLevels: [] });
    expect(usePlayerStore.getState().unlocked.neverGiveUp).toBeDefined();
  });

  it('pops up a toast for rank ups outside a level', () => {
    usePlayerStore.setState({ xp: 290 });
    rewardPracticeSolved();
    expect(usePlayerStore.getState().toasts).toContainEqual({ kind: 'rank', rank: 'apprentice' });
  });

  it('rewards only the first pass of a lesson', () => {
    expect(rewardLessonPassed(true)).toMatchObject({ xp: 50, coins: 10 });
    expect(rewardLessonPassed(false)).toMatchObject({ xp: 0, coins: 0 });
  });

  it('counts chat questions towards the Curious Mind badge', () => {
    for (let i = 0; i < 5; i += 1) rewardChatQuestion();
    expect(usePlayerStore.getState().unlocked.curious).toBeDefined();
    expect(usePlayerStore.getState().toasts).toContainEqual({ kind: 'achievement', id: 'curious' });
  });

  it('saves XP, coins and badges but not the pop-ups', () => {
    rewardChatQuestion();
    usePlayerStore.setState({ xp: 120 });
    const saved = JSON.parse(localStorage.getItem('cb.player')!).state;
    expect(saved).toMatchObject({ xp: 120, coins: START_COINS });
    expect(saved.toasts).toBeUndefined();
  });
});
