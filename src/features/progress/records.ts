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

/** The first level is always open. Every other level opens when the one before it is completed. */
export function isLevelUnlocked(
  levelId: string,
  records: ProgressRecords,
  levels: readonly Level[],
): boolean {
  const index = levels.findIndex((level) => level.id === levelId);
  if (index === -1) return false;
  if (index === 0) return true;
  return records[levels[index - 1].id] !== undefined;
}

export function countStars(records: ProgressRecords, levels: readonly Level[]): number {
  return levels.reduce((sum, level) => sum + (records[level.id]?.stars ?? 0), 0);
}
