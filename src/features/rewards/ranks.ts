/** Engineer ranks. Each needs this much XP in total. Text keys are in i18n "rewards.ranks". */
export const RANKS = [
  { id: 'trainee', xp: 0 },
  { id: 'apprentice', xp: 300 },
  { id: 'technician', xp: 800 },
  { id: 'engineer', xp: 1600 },
  { id: 'senior', xp: 2800 },
  { id: 'chief', xp: 4500 },
] as const;

export type RankId = (typeof RANKS)[number]['id'];

export interface RankInfo {
  id: RankId;
  /** 1 for Trainee, 2 for Apprentice … */
  level: number;
  /** XP needed for the next rank, or null at the top rank. */
  nextXp: number | null;
  /** 0 to 1: how far the player is towards the next rank. */
  progress: number;
}

export function getRank(xp: number): RankInfo {
  let index = 0;
  while (index < RANKS.length - 1 && xp >= RANKS[index + 1].xp) index += 1;
  const rank = RANKS[index];
  const next = RANKS[index + 1];
  return {
    id: rank.id,
    level: index + 1,
    nextXp: next?.xp ?? null,
    progress: next ? (xp - rank.xp) / (next.xp - rank.xp) : 1,
  };
}
