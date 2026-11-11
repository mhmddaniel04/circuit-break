import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BitCharacter } from '@/components/ui/BitCharacter';
import { currentDistrict, DISTRICTS, getDistrictStatus, IsoCity } from '@/features/city';
import { countStars, useProgressStore } from '@/features/progress';
import { todayKey } from '@/features/daily';
import { currentStreak, PlayerBar, usePlayerStore } from '@/features/rewards';
import { LEVELS } from '@/levels';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);
  const nextLanguage = i18n.language === 'en' ? 'ms' : 'en';
  const daily = usePlayerStore((state) => state.daily);
  const today = todayKey();
  const streak = currentStreak(daily, today);
  const dailyDone = daily.lastDate === today;

  const districts = DISTRICTS.map((world) => getDistrictStatus(world, records, lessons));
  const current = currentDistrict(districts);
  const allPowered = districts.every((district) => district.look === 'powered');
  const earned = countStars(records, LEVELS);
  const total = LEVELS.length * 3;

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <PlayerBar />
        <span className={styles.spacer} />
        <p className={styles.chip} title={t('home.stars', { earned, total })}>
          <span aria-hidden="true">★</span> {earned} / {total}
        </p>
        <button
          type="button"
          className={styles.chip}
          onClick={() => i18n.changeLanguage(nextLanguage)}
          aria-label={t('home.switchLanguage')}
        >
          {nextLanguage.toUpperCase()}
        </button>
      </header>

      <div className={styles.hero}>
        <section className={styles.intro}>
          <p className={styles.kicker}>{t('home.kicker')}</p>
          <h1 className={styles.title}>{t('app.title')}</h1>
          <p className={styles.subtitle}>{t('app.subtitle')}</p>
          <p className={styles.tagline}>{t('home.tagline')}</p>

          <nav className={styles.menu}>
            <button type="button" className={styles.play} onClick={() => navigate('/worlds')}>
              <span className={styles.playLabel}>▶ {t('home.play')}</span>
              <span className={styles.playNext}>
                {allPowered
                  ? t('home.allDone')
                  : t('home.continue', { number: current, name: t(`worlds.${current}.name`) })}
              </span>
            </button>
            <button type="button" className={styles.daily} onClick={() => navigate('/daily')}>
              <span className={styles.dailyLabel}>📅 {t('home.daily')}</span>
              <span className={styles.dailyStatus}>
                {dailyDone ? `✓ ${t('home.dailyDone')}` : t('home.dailyNew')}
                {streak > 0 && ` · 🔥 ${t('daily.streak', { count: streak })}`}
              </span>
            </button>
            <div className={styles.secondary}>
              <button type="button" className={styles.small} onClick={() => navigate('/learn')}>
                {t('home.learn')}
              </button>
              <button type="button" className={styles.small} onClick={() => navigate('/practice')}>
                {t('home.practice')}
              </button>
              <button type="button" className={styles.small} onClick={() => navigate('/sandbox')}>
                {t('home.sandbox')}
              </button>
              <button type="button" className={styles.small} onClick={() => navigate('/settings')}>
                {t('home.settings')}
              </button>
            </div>
          </nav>
        </section>

        <div className={styles.scene}>
          {/* The same 2.5D city as the map: its windows light up as the player fixes districts. */}
          <IsoCity districts={districts} selected={0} />
          <BitCharacter className={styles.bit} label={t('home.bitWave')} />
        </div>
      </div>
    </main>
  );
}
