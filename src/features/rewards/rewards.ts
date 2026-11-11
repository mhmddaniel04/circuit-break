import type { LevelRecord } from '@/features/progress';
import type { Stars } from '@/features/scoring';

/** Coins a new player starts with: enough for a few hints. */
export const START_COINS = 30;

/** Each hint on a level costs more than the one before. */
export const HINT_COSTS = [5, 10, 15] as const;

export interface Reward {
  xp: number;
  coins: number;
}

export const NO_REWARD: Reward = { xp: 0, coins: 0 };

/**
 * A solved level gives XP and coins the first time, and again only for extra stars on a replay,
 * so replaying the same level over and over does not farm rewards.
 */
export function levelReward(previous: LevelRecord | undefined, stars: Stars): Reward {
  if (!previous) return { xp: 50 + stars * 25, coins: stars * 5 };
  const extraStars = Math.max(0, stars - previous.stars);
  return { xp: extraStars * 25, coins: extraStars * 5 };
}

export const LESSON_REWARD: Reward = { xp: 50, coins: 10 };
export const PRACTICE_REWARD: Reward = { xp: 20, coins: 3 };
export const ACHIEVEMENT_REWARD: Reward = { xp: 50, coins: 25 };
