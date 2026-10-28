export type Stars = 1 | 2 | 3;

export interface PlayStats {
  /** How many times "Test Circuit" was pressed, including the winning test. */
  attempts: number;
  hintUsed: boolean;
  seconds: number;
  /** The level's target time. */
  parSeconds: number;
}

export const SCORE = {
  base: 1000,
  wrongTestPenalty: 100,
  hintPenalty: 300,
  bonusPerSecondUnderPar: 10,
  minimum: 100,
} as const;

/**
 * ★     the circuit works
 * ★★    ... without using a hint
 * ★★★   ... without a hint, on the first test
 */
export function computeStars({
  attempts,
  hintUsed,
}: Pick<PlayStats, 'attempts' | 'hintUsed'>): Stars {
  if (hintUsed) return 1;
  return attempts <= 1 ? 3 : 2;
}

/** Points for a solved level. Fewer wrong tests, no hint and a fast time give more points. */
export function computeScore({ attempts, hintUsed, seconds, parSeconds }: PlayStats): number {
  const wrongTests = Math.max(0, attempts - 1);
  const timeBonus = Math.max(0, Math.floor(parSeconds - seconds)) * SCORE.bonusPerSecondUnderPar;
  const score =
    SCORE.base -
    wrongTests * SCORE.wrongTestPenalty -
    (hintUsed ? SCORE.hintPenalty : 0) +
    timeBonus;
  return Math.max(SCORE.minimum, score);
}
