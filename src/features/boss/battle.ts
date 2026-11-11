import type { Stars } from '@/features/scoring';
import { getLevelsByWorld, type Level } from '@/levels';
import type { Boss } from './bosses';

export const BOSS_HP = 100;
/** Every correct circuit hits for this much… */
export const BASE_DAMAGE = 25;
/** …plus up to this much more for a fast solve. */
export const MAX_SPEED_BONUS = 15;
/** A speed bonus this big counts as a critical hit. */
export const CRITICAL_BONUS = 8;
/** A wrong test lets the boss charge: it costs this many seconds. */
export const WRONG_TEST_PENALTY = 8;
/** Seconds of warning before confusion hides the chips. */
export const CONFUSION_WARNING = 2;

/**
 * The circuits of a boss fight, in order: the district's three hardest levels, then the boss
 * level itself. If the boss still stands, the list starts again.
 */
export function battleRounds(world: number): Level[] {
  const levels = getLevelsByWorld(world);
  return [...levels.slice(-4, -1), levels[levels.length - 1]];
}

/** Seconds before the boss reaches the city. */
export function battleTimeLimit(boss: Boss): number {
  const par = battleRounds(boss.world).reduce((sum, level) => sum + level.par.seconds, 0);
  return Math.round(par * boss.timeFactor);
}

export interface Attack {
  damage: number;
  critical: boolean;
}

/** A solved circuit's attack: the faster it was solved (against the level's par time), the harder. */
export function attackFor(seconds: number, parSeconds: number): Attack {
  const speed = Math.min(1, Math.max(0, 1 - seconds / parSeconds));
  const bonus = Math.round(MAX_SPEED_BONUS * speed);
  return { damage: BASE_DAMAGE + bonus, critical: bonus >= CRITICAL_BONUS };
}

/** Stars for a win: more time left on the clock means more stars. */
export function battleStars(timeLeft: number, timeLimit: number): Stars {
  const share = timeLeft / timeLimit;
  if (share >= 0.5) return 3;
  return share >= 0.25 ? 2 : 1;
}

export type ConfusionState = 'clear' | 'warning' | 'confused';

/** Whether the boss's confusion is about to start, or is hiding the chips right now. */
export function confusionAt(fightSeconds: number, boss: Boss): ConfusionState {
  if (!boss.confusion) return 'clear';
  const { every, hide } = boss.confusion;
  const phase = fightSeconds % every;
  if (phase >= every - hide) return 'confused';
  if (phase >= every - hide - CONFUSION_WARNING) return 'warning';
  return 'clear';
}
