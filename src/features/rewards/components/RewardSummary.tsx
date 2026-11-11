import { useTranslation } from 'react-i18next';
import type { RewardResult } from '../playerStore';
import styles from './RewardSummary.module.css';

/** What a solved level earned: shown in the "Circuit complete!" window. */
export function RewardSummary({ result }: { result: RewardResult }) {
  const { t } = useTranslation();
  return (
    <div className={styles.summary}>
      {(result.xp > 0 || result.coins > 0) && (
        <p className={styles.earned}>
          <span className={styles.xp}>{t('rewards.plusXp', { xp: result.xp })}</span>
          <span className={styles.coins}>{t('rewards.plusCoins', { count: result.coins })}</span>
        </p>
      )}
      {result.rankUp && (
        <p className={styles.rankUp}>
          ⬆️ {t('rewards.newRank', { rank: t(`rewards.ranks.${result.rankUp}`) })}
        </p>
      )}
      {result.achievements.map((achievement) => (
        <div key={achievement.id} className={styles.badge}>
          <span className={styles.badgeIcon} aria-hidden="true">
            {achievement.icon}
          </span>
          <span>
            <span className={styles.badgeLabel}>{t('rewards.unlocked')}</span>
            <span className={styles.badgeTitle}>
              {t(`rewards.achievements.${achievement.id}.title`)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
