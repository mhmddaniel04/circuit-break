import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { GateCard } from '@/components/learning/GateCard';
import { Button } from '@/components/ui/Button';
import { ChatPanel } from '@/features/chat';
import { isLessonDone, useProgressStore } from '@/features/progress';
import type { GateType } from '@/features/simulation';
import { LESSONS } from '@/lessons';
import { LEVELS } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './LearnPage.module.css';

/** Gates in the order students meet them in the game. */
const GATES: GateType[] = ['NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR'];

export default function LearnPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const records = useProgressStore((state) => state.levels);
  const lessons = useProgressStore((state) => state.lessons);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('map.home')}
        </Button>
        <h1 className={styles.title}>{t('learn.title')}</h1>
      </header>

      <section className={styles.lessons} aria-labelledby="lessons-title">
        <h2 id="lessons-title" className={styles.sectionTitle}>
          {t('learn.lessons')}
        </h2>
        <ol className={styles.lessonList}>
          {LESSONS.map(({ world }) => {
            const done = isLessonDone(world, lessons, records, LEVELS);
            return (
              <li key={world}>
                <Link to={`/lesson/${world}`} className={cx(styles.lesson, done && styles.done)}>
                  <span className={styles.lessonWorld}>{t('map.world', { number: world })}</span>
                  <span className={styles.lessonName}>{t(`worlds.${world}.name`)}</span>
                  <span className={styles.lessonStatus}>
                    {done ? `✅ ${t('learn.lessonDone')}` : `📖 ${t('learn.lessonStart')}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <h2 className={styles.sectionTitle}>{t('learn.reference')}</h2>
      <p className={styles.intro}>{t('learn.intro')}</p>

      <div className={styles.cards}>
        {GATES.map((gate) => (
          <GateCard key={gate} gate={gate} headingLevel={3} />
        ))}
      </div>

      <ChatPanel world={null} />
    </main>
  );
}
