import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BitCharacter } from '@/components/ui/BitCharacter';
import { currentDistrict, DISTRICTS, getDistrictStatus } from '@/features/city';
import { countStars, useProgressStore } from '@/features/progress';
import { LEVELS } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './HomePage.module.css';

/** Windows of the skyline behind Bit: [x, y, width]. One district lights each group. */
const WINDOWS: [number, number, number][][] = [
  [
    [58, 410, 18],
    [94, 450, 18],
    [58, 490, 18],
  ],
  [
    [160, 330, 20],
    [206, 330, 20],
    [160, 378, 20],
  ],
  [
    [206, 378, 20],
    [160, 426, 20],
    [206, 426, 20],
  ],
  [
    [490, 360, 20],
    [540, 410, 20],
    [490, 410, 20],
  ],
  [
    [540, 360, 20],
    [578, 450, 18],
    [578, 490, 18],
  ],
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);
  const nextLanguage = i18n.language === 'en' ? 'ms' : 'en';

  const districts = DISTRICTS.map((world) => getDistrictStatus(world, records, lessons));
  const current = currentDistrict(districts);
  const allPowered = districts.every((district) => district.look === 'powered');
  const earned = countStars(records, LEVELS);
  const total = LEVELS.length * 3;

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
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
            <div className={styles.secondary}>
              <button type="button" className={styles.small} onClick={() => navigate('/learn')}>
                {t('home.learn')}
              </button>
              <button type="button" className={styles.small} onClick={() => navigate('/practice')}>
                {t('home.practice')}
              </button>
              <button type="button" className={styles.small} onClick={() => navigate('/settings')}>
                {t('home.settings')}
              </button>
            </div>
          </nav>
        </section>

        <div className={styles.scene}>
          <svg className={styles.skyline} viewBox="0 0 640 640" aria-hidden="true">
            <rect x="40" y="380" width="90" height="260" className={styles.building} />
            <rect x="140" y="300" width="110" height="340" className={styles.buildingLight} />
            <rect x="470" y="330" width="120" height="310" className={styles.buildingLight} />
            <rect x="560" y="420" width="80" height="220" className={styles.building} />
            {WINDOWS.map((group, district) =>
              group.map(([x, y, size]) => (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={size}
                  height={size}
                  rx={2}
                  className={cx(
                    districts[district]?.look === 'powered' ? styles.windowOn : styles.windowOff,
                  )}
                />
              )),
            )}
            <rect x="0" y="600" width="640" height="40" className={styles.ground} />
          </svg>
          <BitCharacter className={styles.bit} label={t('home.bitWave')} />
        </div>
      </div>
    </main>
  );
}
