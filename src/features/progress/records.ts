import type { Stars } from '@/features/scoring';
import type { Level } from '@/levels';

/** The result of one finished level. */
export interface LevelResult {
  stars: Stars;
  score: number;
  seconds: number;
}

/** The best result saved for a level. */
export interface LevelRecord {
  stars: Stars;
  bestScore: number;
  bestSeconds: number;
}

export type ProgressRecords = Partial<Record<string, LevelRecord>>;

/** World number → true once its lesson quiz has been passed. */
export type LessonRecords = Partial<Record<number, true>>;

/** Why a level cannot be played yet: its world's lesson, or the level before it. */
export type LevelLock = 'lesson' | 'previous';

/** Keeps the best stars, score and time across all attempts. */
export function mergeRecord(previous: LevelRecord | undefined, result: LevelResult): LevelRecord {
  if (!previous) {
    return { stars: result.stars, bestScore: result.score, bestSeconds: result.seconds };
  }
  return {
    stars: Math.max(previous.stars, result.stars) as Stars,
    bestScore: Math.max(previous.bestScore, result.score),
    bestSeconds: Math.min(previous.bestSeconds, result.seconds),
  };
}

/**
 * A lesson counts as done once its quiz is passed. Players who finished a level in that world
 * before lessons existed also count as done, so nobody loses access to levels they have played.
 */
export function isLessonDone(
  world: number,
  lessons: LessonRecords,
  records: ProgressRecords,
  levels: readonly Level[],
): boolean {
  return (
    lessons[world] === true ||
    levels.some((level) => level.world === world && records[level.id] !== undefined)
  );
}

/**
 * A level opens when its world's lesson is done and the level before it is completed.
 * Returns null when the level can be played, or the reason it is locked.
 */
export function getLevelLock(
  levelId: string,
  records: ProgressRecords,
  lessons: LessonRecords,
  levels: readonly Level[],
): LevelLock | null {
  const index = levels.findIndex((level) => level.id === levelId);
  if (index === -1) return 'previous';
  if (!isLessonDone(levels[index].world, lessons, records, levels)) return 'lesson';
  if (index > 0 && records[levels[index - 1].id] === undefined) return 'previous';
  return null;
}

export function isLevelUnlocked(
  levelId: string,
  records: ProgressRecords,
  lessons: LessonRecords,
  levels: readonly Level[],
): boolean {
  return getLevelLock(levelId, records, lessons, levels) === null;
}

export function countStars(records: ProgressRecords, levels: readonly Level[]): number {
  return levels.reduce((sum, level) => sum + (records[level.id]?.stars ?? 0), 0);
}
