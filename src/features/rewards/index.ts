// Public API of the rewards feature: XP, ranks, coins and achievements.
export { ACHIEVEMENTS, type Achievement, type PlayerStats } from './achievements';
export { CoinChip, PlayerBar } from './components/PlayerBar';
export { RewardSummary } from './components/RewardSummary';
export { RewardToasts } from './components/RewardToasts';
export {
  rewardChatQuestion,
  rewardLessonPassed,
  rewardLevelSolved,
  rewardPracticeSolved,
  usePlayerStore,
  type RewardResult,
} from './playerStore';
export { getRank, RANKS, type RankId } from './ranks';
export { HINT_COSTS, levelReward, START_COINS } from './rewards';
