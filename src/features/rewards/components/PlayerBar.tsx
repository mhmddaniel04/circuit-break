import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ACHIEVEMENTS } from '../achievements';
import { usePlayerStore } from '../playerStore';
import { getRank } from '../ranks';
import styles from './PlayerBar.module.css';

/** Rank, XP towards the next rank, coins and badges: the player's card on the home screen. */
export function PlayerBar() {
  const { t } = useTranslation();
  const xp = usePlayerStore((state) => state.xp);
  const coins = usePlayerStore((state) => state.coins);
  const unlocked = usePlayerStore((state) => state.unlocked);
  const rank = getRank(xp);
  const badges = ACHIEVEMENTS.filter((achievement) => unlocked[achievement.id]).length;

  return (
    <div className={styles.bar}>
      <div className={styles.rank}>
        <span className={styles.level} aria-hidden="true">
          {rank.level}
        </span>
        <div className={styles.rankText}>
          <span className={styles.rankName}>{t(`rewards.ranks.${rank.id}`)}</span>
          <span
            className={styles.xpBar}
            role="progressbar"
            aria-label={t('rewards.xpLabel')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(rank.progress * 100)}
            aria-valuetext={
              rank.nextXp === null
                ? t('rewards.maxRank', { xp })
                : t('rewards.xpProgress', { xp, next: rank.nextXp })
            }
          >
            <span style={{ width: `${rank.progress * 100}%` }} />
          </span>
          <span className={styles.xpText}>
            {rank.nextXp === null
              ? t('rewards.maxRank', { xp })
              : t('rewards.xpProgress', { xp, next: rank.nextXp })}
          </span>
        </div>
      </div>
      <CoinChip coins={coins} />
      <Link to="/achievements" className={styles.chip}>
        <span aria-hidden="true">🏆</span>{' '}
        {t('rewards.badgesCount', { count: badges, total: ACHIEVEMENTS.length })}
      </Link>
    </div>
  );
}

/** The player's coins. */
export function CoinChip({ coins }: { coins: number }) {
  const { t } = useTranslation();
  return (
    <span className={styles.chip} title={t('rewards.coinsLabel', { count: coins })}>
      <span className={styles.coin} aria-hidden="true">
        ¢
      </span>
      <span className={styles.srOnly}>{t('rewards.coinsLabel', { count: coins })}</span>
      <span aria-hidden="true">{coins}</span>
    </span>
  );
}
