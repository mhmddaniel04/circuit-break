import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useProgressStore, type LevelRecord } from '@/features/progress';
import type { Stars } from '@/features/scoring';
import { EMPTY_STATS, newlyEarned, type Achievement, type PlayerStats } from './achievements';
import { getRank, type RankId } from './ranks';
import {
  ACHIEVEMENT_REWARD,
  BOSS_REWARD,
  dailyReward,
  LESSON_REWARD,
  levelReward,
  NO_REWARD,
  PRACTICE_REWARD,
  START_COINS,
  type Reward,
} from './rewards';

/** A pop-up message after a reward that happened outside the "level complete" window. */
export type Toast = { kind: 'achievement'; id: string } | { kind: 'rank'; rank: RankId };

/** What one event earned, so the screen can show it. */
export interface RewardResult extends Reward {
  achievements: Achievement[];
  /** The new rank, if the player moved up. */
  rankUp: RankId | null;
  /** A boss level was beaten before its clock ran out, for the first time. */
  bossBonus?: boolean;
}

/** The daily challenge: the last day it was done and the run of days in a row. */
export interface DailyRecord {
  /** Local date "YYYY-MM-DD", or null if never done. */
  lastDate: string | null;
  streak: number;
}

interface PlayerState {
  xp: number;
  coins: number;
  /** Achievement id → when it was unlocked (ISO date). */
  unlocked: Partial<Record<string, string>>;
  stats: PlayerStats;
  daily: DailyRecord;
  /** Not saved: pop-ups waiting to be shown. */
  toasts: Toast[];
  grant: (reward: Reward, options?: { toast?: boolean }) => RewardResult;
  updateStats: (change: (stats: PlayerStats) => PlayerStats) => void;
  /** Takes coins if the player has enough. Returns false (and takes nothing) otherwise. */
  spendCoins: (amount: number) => boolean;
  /** Gives coins back, e.g. when a bought hint could not be delivered. */
  refundCoins: (amount: number) => void;
  dismissToast: () => void;
  resetPlayer: () => void;
}

const initialPlayer = {
  xp: 0,
  coins: START_COINS,
  unlocked: {},
  stats: EMPTY_STATS,
  daily: { lastDate: null, streak: 0 } as DailyRecord,
  toasts: [],
};

/** XP, coins, achievements and the counters behind them, saved in the browser. */
export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      ...initialPlayer,

      grant: (reward, { toast = false } = {}) => {
        const before = get();
        const { levels: records, lessons } = useProgressStore.getState();
        const earned = newlyEarned({ records, lessons, stats: before.stats }, before.unlocked);
        const now = new Date().toISOString();

        const xp = reward.xp + earned.length * ACHIEVEMENT_REWARD.xp;
        const coins = reward.coins + earned.length * ACHIEVEMENT_REWARD.coins;
        const oldRank = getRank(before.xp);
        const newRank = getRank(before.xp + xp);
        const rankUp = newRank.level > oldRank.level ? newRank.id : null;

        const toasts: Toast[] = toast
          ? [
              ...earned.map((achievement) => ({
                kind: 'achievement' as const,
                id: achievement.id,
              })),
              ...(rankUp ? [{ kind: 'rank' as const, rank: rankUp }] : []),
            ]
          : [];

        set({
          xp: before.xp + xp,
          coins: before.coins + coins,
          unlocked: {
            ...before.unlocked,
            ...Object.fromEntries(earned.map((achievement) => [achievement.id, now])),
          },
          toasts: [...before.toasts, ...toasts],
        });
        return { xp, coins, achievements: earned, rankUp };
      },

      updateStats: (change) => set({ stats: change(get().stats) }),

      spendCoins: (amount) => {
        if (get().coins < amount) return false;
        set({ coins: get().coins - amount });
        return true;
      },

      refundCoins: (amount) => set({ coins: get().coins + amount }),

      dismissToast: () => set({ toasts: get().toasts.slice(1) }),

      resetPlayer: () => set(initialPlayer),
    }),
    {
      name: 'cb.player',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ xp, coins, unlocked, stats, daily }) => ({
        xp,
        coins,
        unlocked,
        stats,
        daily,
      }),
      // Saves from older versions miss newer counters: fill them in instead of losing the save.
      merge: (saved, current) => {
        const old = (saved ?? {}) as Partial<PlayerState>;
        return {
          ...current,
          ...old,
          stats: { ...EMPTY_STATS, ...old.stats },
          daily: { ...initialPlayer.daily, ...old.daily },
        };
      },
    },
  ),
);

const addOnce = (list: string[], id: string) => (list.includes(id) ? list : [...list, id]);

/** Call after a level is solved and its result saved. The win window shows what was earned. */
export function rewardLevelSolved(play: {
  levelId: string;
  previous: LevelRecord | undefined;
  stars: Stars;
  attempts: number;
  seconds: number;
  parSeconds: number;
  hintsBought: number;
  /** A boss level solved before its clock ran out. */
  bossInTime?: boolean;
}): RewardResult {
  const player = usePlayerStore.getState();
  const bossBonus = play.bossInTime === true && !player.stats.bossesBeaten.includes(play.levelId);
  player.updateStats((stats) => ({
    ...stats,
    bossesBeaten: bossBonus ? [...stats.bossesBeaten, play.levelId] : stats.bossesBeaten,
    noHintLevels:
      play.hintsBought === 0 ? addOnce(stats.noHintLevels, play.levelId) : stats.noHintLevels,
    underParLevels:
      play.seconds < play.parSeconds
        ? addOnce(stats.underParLevels, play.levelId)
        : stats.underParLevels,
    comeback: stats.comeback || play.attempts >= 4,
  }));
  const reward = levelReward(play.previous, play.stars);
  const total = bossBonus
    ? { xp: reward.xp + BOSS_REWARD.xp, coins: reward.coins + BOSS_REWARD.coins }
    : reward;
  return { ...player.grant(total), bossBonus };
}

/** The day before a local "YYYY-MM-DD" date. */
export function previousDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const before = new Date(year, month - 1, day - 1);
  return [
    before.getFullYear(),
    String(before.getMonth() + 1).padStart(2, '0'),
    String(before.getDate()).padStart(2, '0'),
  ].join('-');
}

/** The streak to show today: it is lost when a whole day is missed. */
export function currentStreak(daily: DailyRecord, today: string): number {
  return daily.lastDate === today || daily.lastDate === previousDay(today) ? daily.streak : 0;
}

/**
 * Call when the daily challenge is solved. Only the first solve each day counts: it extends
 * the streak (or starts a new one) and gives the daily reward.
 */
export function rewardDailySolved(
  today: string,
): RewardResult & { streak: number; firstToday: boolean } {
  const player = usePlayerStore.getState();
  if (player.daily.lastDate === today) {
    return { ...player.grant(NO_REWARD), streak: player.daily.streak, firstToday: false };
  }
  const streak = player.daily.lastDate === previousDay(today) ? player.daily.streak + 1 : 1;
  usePlayerStore.setState({ daily: { lastDate: today, streak } });
  player.updateStats((stats) => ({
    ...stats,
    dailySolved: stats.dailySolved + 1,
    bestStreak: Math.max(stats.bestStreak, streak),
  }));
  return { ...player.grant(dailyReward(streak)), streak, firstToday: true };
}

/** Call after a lesson's quick check is passed. Only the first pass gives XP and coins. */
export function rewardLessonPassed(firstTime: boolean): RewardResult {
  return usePlayerStore.getState().grant(firstTime ? LESSON_REWARD : NO_REWARD, { toast: true });
}

/** Call when an SPM practice question is fully correct. */
export function rewardPracticeSolved(): RewardResult {
  const player = usePlayerStore.getState();
  player.updateStats((stats) => ({ ...stats, practiceSolved: stats.practiceSolved + 1 }));
  return player.grant(PRACTICE_REWARD, { toast: true });
}

/** Call when Bit has answered a chat question. */
export function rewardChatQuestion(): void {
  const player = usePlayerStore.getState();
  player.updateStats((stats) => ({ ...stats, chatQuestions: stats.chatQuestions + 1 }));
  player.grant(NO_REWARD, { toast: true });
}
