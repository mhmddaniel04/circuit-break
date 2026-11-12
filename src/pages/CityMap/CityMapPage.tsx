import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Stars';
import {
  CITY_VIEWBOX,
  currentDistrict,
  DISTRICTS,
  getDistrictStatus,
  IsoCity,
  tagPosition,
  type DistrictStatus,
} from '@/features/city';
import { countStars, isLevelUnlocked, useProgressStore } from '@/features/progress';
import { isBossLevel, LEVELS } from '@/levels';
import { cx } from '@/lib/cx';
import { prefersReducedMotion } from '@/lib/motion';
import styles from './CityMapPage.module.css';

/** How long the city zooms into a district before a level opens. Matches the CSS. */
export const DIVE_MS = 500;

/** The world map, drawn as a city: every world is a district that lights up as it is fixed. */
export default function CityMapPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);
  const districts = DISTRICTS.map((world) => getDistrictStatus(world, records, lessons));
  const [selected, setSelected] = useState(() => currentDistrict(districts));
  const powered = districts.filter((district) => district.look === 'powered').length;
  const earned = countStars(records, LEVELS);

  // The camera always points at the selected district: arriving from the Play button, the city
  // starts zoomed in there and settles back; opening a level, it zooms in there again.
  const location = useLocation();
  const [arrived] = useState(() =>
    Boolean((location.state as { zoomIn?: boolean } | null)?.zoomIn),
  );
  // Forget the zoom once played, so coming back from a level does not zoom again.
  useEffect(() => {
    if (arrived) navigate(location.pathname, { replace: true, state: null });
  }, [arrived, navigate, location.pathname]);

  const [diving, setDiving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const openLevel = (event: MouseEvent, levelId: string) => {
    const newTab = event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
    if (newTab || prefersReducedMotion()) return;
    event.preventDefault();
    if (diving) return;
    setDiving(true);
    timer.current = window.setTimeout(
      () => navigate(`/level/${levelId}`, { state: { zoomIn: true }, viewTransition: true }),
      DIVE_MS,
    );
  };

  const focus = tagPosition(selected);
  const camera = {
    '--zoom-x': `${(focus.x / CITY_VIEWBOX.width) * 100}%`,
    '--zoom-y': `${(focus.y / CITY_VIEWBOX.height) * 100}%`,
  } as CSSProperties;

  const status = (district: DistrictStatus) => {
    if (district.look === 'powered') return t('map.statusPowered', { stars: district.stars });
    if (district.done > 0) {
      return t('map.statusProgress', { done: district.done, total: district.levels.length });
    }
    if (district.reachable)
      return district.lessonDone
        ? t('map.statusProgress', { done: 0, total: district.levels.length })
        : t('map.statusLesson');
    return t('map.statusLocked');
  };

  return (
    <main
      className={cx(styles.page, arrived && styles.arrive, diving && styles.diving)}
      style={camera}
    >
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/', { viewTransition: true })}>
          ← {t('map.home')}
        </Button>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t('map.title')}</h1>
          <p className={styles.subtitle}>
            {t('map.powered', { done: powered, total: districts.length })}
          </p>
        </div>
        <p
          className={styles.total}
          title={t('map.totalStars', { earned, total: LEVELS.length * 3 })}
        >
          ★ {earned} / {LEVELS.length * 3}
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.map} aria-label={t('map.cityLabel')}>
          <IsoCity districts={districts} selected={selected} />
          {districts.map((district, index) => {
            const { x, y, place } = tagPosition(district.world);
            return (
              <button
                key={district.world}
                type="button"
                className={cx(
                  styles.tag,
                  place === 'below' && styles.tagBelow,
                  styles[district.look],
                  district.world === selected && styles.tagSelected,
                )}
                style={{
                  left: `${(x / CITY_VIEWBOX.width) * 100}%`,
                  top: `${(y / CITY_VIEWBOX.height) * 100}%`,
                  ['--order' as string]: index,
                }}
                aria-pressed={district.world === selected}
                onClick={() => setSelected(district.world)}
              >
                <span className={styles.tagNumber}>{district.world}</span>
                <span className={styles.tagText}>
                  <span className={styles.tagName}>{t(`worlds.${district.world}.name`)}</span>
                  <span className={styles.tagStatus}>{status(district)}</span>
                </span>
              </button>
            );
          })}
        </section>

        <DistrictPanel
          district={districts[selected - 1]}
          status={status(districts[selected - 1])}
          onOpenLevel={openLevel}
        />
      </div>
    </main>
  );
}

interface DistrictPanelProps {
  district: DistrictStatus;
  status: string;
  onOpenLevel: (event: MouseEvent, levelId: string) => void;
}

function DistrictPanel({ district, status, onOpenLevel }: DistrictPanelProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ms' ? 'ms' : 'en';
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);
  const total = district.levels.length;

  return (
    <aside className={styles.panel} aria-labelledby="district-title">
      <p className={styles.panelKicker}>{t('map.world', { number: district.world })}</p>
      <h2 id="district-title" className={styles.panelTitle}>
        {t(`worlds.${district.world}.name`)}
      </h2>
      <p className={styles.panelText}>{t(`worlds.${district.world}.description`)}</p>

      <div className={styles.progress}>
        <div className={styles.progressBar} aria-hidden="true">
          <span style={{ width: `${total ? (district.done / total) * 100 : 0}%` }} />
        </div>
        <span className={styles.progressText}>{status}</span>
      </div>

      {district.lessonDone ? (
        <Link to={`/lesson/${district.world}`} className={styles.lessonDone}>
          ✅ {t('map.lessonDone')} · {t('map.reviewLesson')}
        </Link>
      ) : (
        <div>
          <Link to={`/lesson/${district.world}`} className={styles.lessonStart}>
            📖 {t('map.startLesson')}
          </Link>
          <p className={styles.lessonNote}>{t('map.lessonFirst')}</p>
        </div>
      )}

      <ol className={styles.levels} aria-label={t('map.levels')}>
        {district.levels.map((level) => {
          const record = records[level.id];
          if (!isLevelUnlocked(level.id, records, lessons, LEVELS)) {
            return (
              <li key={level.id} className={cx(styles.level, styles.locked)}>
                <span className={styles.levelNumber} aria-hidden="true">
                  🔒
                </span>
                <span className={styles.levelTitle}>
                  {level.title[lang]}
                  {isBossLevel(level) && <BossTag />}
                </span>
                <span className={styles.srOnly}>{t('map.locked')}</span>
              </li>
            );
          }
          return (
            <li key={level.id}>
              <Link
                to={`/level/${level.id}`}
                onClick={(event) => onOpenLevel(event, level.id)}
                className={cx(styles.level, record ? styles.completed : styles.next)}
              >
                <span className={styles.levelNumber}>{level.order}</span>
                <span className={styles.levelTitle}>
                  {level.title[lang]}
                  {isBossLevel(level) && <BossTag />}
                </span>
                <Stars
                  count={record?.stars ?? 0}
                  label={t('level.starsLabel', { count: record?.stars ?? 0 })}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function BossTag() {
  const { t } = useTranslation();
  return <span className={styles.bossTag}>👾 {t('boss.tag')}</span>;
}
