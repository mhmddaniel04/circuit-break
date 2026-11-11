import {
  countStars,
  isLessonDone,
  type LessonRecords,
  type ProgressRecords,
} from '@/features/progress';
import { getLevelsByWorld, LEVELS } from '@/levels';

/** Counters the achievements need, saved with the player. */
export interface PlayerStats {
  /** Levels solved at least once without buying a hint. */
  noHintLevels: string[];
  /** Levels solved faster than their par time. */
  underParLevels: string[];
  practiceSolved: number;
  chatQuestions: number;
  /** Solved a level after at least 3 wrong tests. */
  comeback: boolean;
  /** Boss levels beaten before their clock ran out. */
  bossesBeaten: string[];
  dailySolved: number;
  /** The longest run of days in a row with the daily challenge done. */
  bestStreak: number;
}

export const EMPTY_STATS: PlayerStats = {
  noHintLevels: [],
  underParLevels: [],
  practiceSolved: 0,
  chatQuestions: 0,
  comeback: false,
  bossesBeaten: [],
  dailySolved: 0,
  bestStreak: 0,
};

export interface AchievementContext {
  records: ProgressRecords;
  lessons: LessonRecords;
  stats: PlayerStats;
}

export interface Achievement {
  id: string;
  /** Shown big on the badge. */
  icon: string;
  /** For the "3 / 5" progress line on locked badges. */
  goal: number;
  progress: (context: AchievementContext) => number;
}

const solvedCount = ({ records }: AchievementContext) =>
  LEVELS.filter((level) => records[level.id] !== undefined).length;

const poweredDistricts = ({ records }: AchievementContext) =>
  [1, 2, 3, 4, 5].filter((world) => {
    const levels = getLevelsByWorld(world);
    return levels.length > 0 && levels.every((level) => records[level.id] !== undefined);
  }).length;

/** Every badge in the game. Titles and descriptions are in i18n "rewards.achievements.<id>". */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'firstLight', icon: '💡', goal: 1, progress: solvedCount },
  {
    id: 'perfectionist',
    icon: '⭐',
    goal: 5,
    progress: ({ records }) => LEVELS.filter((level) => records[level.id]?.stars === 3).length,
  },
  { id: 'selfMade', icon: '🧠', goal: 10, progress: ({ stats }) => stats.noHintLevels.length },
  { id: 'lightning', icon: '⚡', goal: 5, progress: ({ stats }) => stats.underParLevels.length },
  { id: 'neverGiveUp', icon: '💪', goal: 1, progress: ({ stats }) => (stats.comeback ? 1 : 0) },
  { id: 'poweredUp', icon: '🏙️', goal: 1, progress: poweredDistricts },
  { id: 'halfCity', icon: '🌆', goal: 3, progress: poweredDistricts },
  { id: 'cityLights', icon: '🌃', goal: 5, progress: poweredDistricts },
  {
    id: 'bookworm',
    icon: '📚',
    goal: 5,
    progress: ({ records, lessons }) =>
      [1, 2, 3, 4, 5].filter((world) => isLessonDone(world, lessons, records, LEVELS)).length,
  },
  { id: 'examReady', icon: '📝', goal: 10, progress: ({ stats }) => stats.practiceSolved },
  { id: 'curious', icon: '💬', goal: 5, progress: ({ stats }) => stats.chatQuestions },
  { id: 'bossSlayer', icon: '👾', goal: 5, progress: ({ stats }) => stats.bossesBeaten.length },
  { id: 'dailyStarter', icon: '📅', goal: 1, progress: ({ stats }) => stats.dailySolved },
  { id: 'onFire', icon: '🔥', goal: 7, progress: ({ stats }) => stats.bestStreak },
  {
    id: 'superstar',
    icon: '🌟',
    goal: LEVELS.length * 3,
    progress: ({ records }) => countStars(records, LEVELS),
  },
];

/** Badges whose goal is reached but that are not unlocked yet. */
export function newlyEarned(
  context: AchievementContext,
  unlocked: Partial<Record<string, string>>,
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (achievement) => !unlocked[achievement.id] && achievement.progress(context) >= achievement.goal,
  );
}
