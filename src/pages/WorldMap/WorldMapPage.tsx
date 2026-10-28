import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Stars';
import { countStars, isLevelUnlocked, useProgressStore } from '@/features/progress';
import { getLevelsByWorld, LEVELS } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './WorldMapPage.module.css';

/** Every world in the game. Worlds without level files yet show "Coming soon". */
const WORLD_IDS = [1, 2, 3, 4, 5] as const;

export default function WorldMapPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const records = useProgressStore((state) => state.levels);
  const lang = i18n.language === 'ms' ? 'ms' : 'en';
  const earned = countStars(records, LEVELS);
  const total = LEVELS.length * 3;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('map.home')}
        </Button>
        <h1 className={styles.title}>{t('map.title')}</h1>
        <p className={styles.total} title={t('map.totalStars', { earned, total })}>
          ★ {earned} / {total}
        </p>
      </header>

      <div className={styles.worlds}>
        {WORLD_IDS.map((world) => {
          const levels = getLevelsByWorld(world);
          return (
            <section
              key={world}
              className={cx(styles.world, levels.length === 0 && styles.comingSoon)}
              aria-labelledby={`world-${world}`}
            >
              <p className={styles.worldNumber}>{t('map.world', { number: world })}</p>
              <h2 id={`world-${world}`} className={styles.worldName}>
                {t(`worlds.${world}.name`)}
              </h2>
              <p className={styles.worldDescription}>{t(`worlds.${world}.description`)}</p>

              {levels.length === 0 ? (
                <p className={styles.soon}>{t('map.comingSoon')}</p>
              ) : (
                <ol className={styles.levels}>
                  {levels.map((level) => {
                    const record = records[level.id];
                    if (!isLevelUnlocked(level.id, records, LEVELS)) {
                      return (
                        <li key={level.id} className={cx(styles.level, styles.locked)}>
                          <span className={styles.levelNumber} aria-hidden="true">
                            🔒
                          </span>
                          <span className={styles.levelTitle}>{level.title[lang]}</span>
                          <span className={styles.srOnly}>{t('map.locked')}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={level.id}>
                        <Link
                          to={`/level/${level.id}`}
                          className={cx(styles.level, record && styles.completed)}
                        >
                          <span className={styles.levelNumber}>{level.order}</span>
                          <span className={styles.levelTitle}>{level.title[lang]}</span>
                          <Stars
                            count={record?.stars ?? 0}
                            label={t('level.starsLabel', { count: record?.stars ?? 0 })}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
