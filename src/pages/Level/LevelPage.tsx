import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { getLevelLock, useProgressStore } from '@/features/progress';
import { getLevel, isBossLevel, LEVELS } from '@/levels';
import { BossBattle } from '../Boss/BossBattle';
import styles from './LevelPage.module.css';
import { LevelView } from './LevelView';

export default function LevelPage() {
  const { levelId = '' } = useParams();
  const { t } = useTranslation();
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);
  // Changing this number restarts the level (used by "Play again").
  const [run, setRun] = useState(0);
  const level = getLevel(levelId);

  if (!level) return <Notice text={t('level.notFound')} />;

  const lock = getLevelLock(level.id, records, lessons, LEVELS);
  if (lock === 'lesson') {
    return (
      <Notice
        text={t('level.lessonLocked', { world: level.world })}
        link={{ to: `/lesson/${level.world}`, label: t('level.openLesson') }}
      />
    );
  }
  if (lock === 'previous') return <Notice text={t('level.locked')} />;

  // The last level of each district is fought as a boss battle.
  if (isBossLevel(level)) {
    return (
      <BossBattle key={run} world={level.world} onRestart={() => setRun((count) => count + 1)} />
    );
  }

  return (
    <LevelView
      key={`${level.id}-${run}`}
      level={level}
      onReplay={() => setRun((count) => count + 1)}
    />
  );
}

function Notice({ text, link }: { text: string; link?: { to: string; label: string } }) {
  const { t } = useTranslation();
  return (
    <main className={styles.page}>
      <p className={styles.message}>{text}</p>
      {link && (
        <Link to={link.to} className={styles.mapLink}>
          📖 {link.label}
        </Link>
      )}
      <Link to="/worlds" className={styles.mapLink}>
        {t('level.worldMap')}
      </Link>
    </main>
  );
}
