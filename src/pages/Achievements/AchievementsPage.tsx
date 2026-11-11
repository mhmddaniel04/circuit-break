import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { useProgressStore } from '@/features/progress';
import { ACHIEVEMENTS, PlayerBar, usePlayerStore } from '@/features/rewards';
import { cx } from '@/lib/cx';
import styles from './AchievementsPage.module.css';

/** Every badge, unlocked or still to earn, with progress towards each one. */
export default function AchievementsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);
  const unlocked = usePlayerStore((state) => state.unlocked);
  const stats = usePlayerStore((state) => state.stats);
  const context = { records, lessons, stats };
  const count = ACHIEVEMENTS.filter((achievement) => unlocked[achievement.id]).length;
  const dateFormat = new Intl.DateTimeFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-GB', {
    dateStyle: 'medium',
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('map.home')}
        </Button>
        <h1 className={styles.title}>{t('rewards.badgesTitle')}</h1>
      </header>
      <div className={styles.player}>
        <PlayerBar />
      </div>
      <p className={styles.summary}>
        {t('rewards.badgesSummary', { count, total: ACHIEVEMENTS.length })}
      </p>

      <ul className={styles.grid}>
        {ACHIEVEMENTS.map((achievement) => {
          const when = unlocked[achievement.id];
          const progress = Math.min(achievement.goal, achievement.progress(context));
          return (
            <li key={achievement.id} className={cx(styles.badge, when ? styles.on : styles.off)}>
              <span className={styles.icon} aria-hidden="true">
                {achievement.icon}
              </span>
              <h2 className={styles.badgeTitle}>
                {t(`rewards.achievements.${achievement.id}.title`)}
              </h2>
              <p className={styles.text}>
                {t(`rewards.achievements.${achievement.id}.description`, {
                  goal: achievement.goal,
                })}
              </p>
              {when ? (
                <p className={styles.date}>
                  ✓ {t('rewards.unlockedOn', { date: dateFormat.format(new Date(when)) })}
                </p>
              ) : (
                <div className={styles.progress}>
                  <span className={styles.progressBar} aria-hidden="true">
                    <span style={{ width: `${(progress / achievement.goal) * 100}%` }} />
                  </span>
                  <span className={styles.progressText}>
                    {t('rewards.progress', { done: progress, goal: achievement.goal })}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
