import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { ChatPanel } from '@/features/chat';
import { rewardLessonPassed } from '@/features/rewards';
import { useProgressStore } from '@/features/progress';
import { getLesson, passMark, type Lesson } from '@/lessons';
import { getLevelsByWorld } from '@/levels';
import { cx } from '@/lib/cx';
import { LessonBlocks } from './LessonBlocks';
import styles from './LessonPage.module.css';
import { LessonQuiz } from './LessonQuiz';

export default function LessonPage() {
  const { world = '' } = useParams();
  const { t } = useTranslation();
  const lesson = getLesson(Number(world));

  if (!lesson) {
    return (
      <main className={styles.page}>
        <p className={styles.notFound}>{t('lesson.notFound')}</p>
        <Link to="/worlds" className={styles.mapLink}>
          {t('level.worldMap')}
        </Link>
      </main>
    );
  }

  return <LessonView key={lesson.world} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const alreadyPassed = useProgressStore((state) => state.lessons[lesson.world] === true);
  const lang = i18n.language === 'ms' ? 'ms' : 'en';

  // 0 … steps.length - 1 are the reading steps; steps.length is the quick check.
  const [stage, setStage] = useState(0);
  const total = lesson.steps.length + 1;
  const inQuiz = stage === lesson.steps.length;
  const step = lesson.steps[stage];
  const firstLevel = getLevelsByWorld(lesson.world)[0];

  // Start each new step at the top, with the keyboard/screen reader focus on its title.
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    titleRef.current?.focus();
  }, [stage]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/worlds')}>
          ← {t('level.worldMap')}
        </Button>
        <div className={styles.titleBlock}>
          <p className={styles.label}>{t('lesson.label', { number: lesson.world })}</p>
          <h1 className={styles.title}>{t(`worlds.${lesson.world}.name`)}</h1>
        </div>
      </header>

      <div
        className={styles.progress}
        role="progressbar"
        aria-label={t('lesson.progress')}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={stage + 1}
        aria-valuetext={t('lesson.step', { current: stage + 1, total })}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cx(styles.segment, i <= stage && styles.segmentDone)} />
        ))}
      </div>

      <article className={styles.card}>
        <p className={styles.stepCount}>{t('lesson.step', { current: stage + 1, total })}</p>
        <h2 ref={titleRef} tabIndex={-1} className={styles.stepTitle}>
          {inQuiz ? t('lesson.quizTitle') : step.title[lang]}
        </h2>

        {inQuiz ? (
          <>
            <p className={styles.text}>
              {t('lesson.quizIntro', { total: lesson.quiz.length, pass: passMark(lesson) })}
            </p>
            <LessonQuiz
              lesson={lesson}
              lang={lang}
              onPass={() => {
                completeLesson(lesson.world);
                rewardLessonPassed(!alreadyPassed);
              }}
              onReview={() => setStage(0)}
              passedActions={
                <>
                  <Button variant="secondary" onClick={() => navigate('/worlds')}>
                    {t('level.worldMap')}
                  </Button>
                  {firstLevel && (
                    <Button onClick={() => navigate(`/level/${firstLevel.id}`)}>
                      {t('lesson.playFirst')} →
                    </Button>
                  )}
                </>
              }
            />
          </>
        ) : (
          <>
            <div className={styles.blocks}>
              <LessonBlocks blocks={step.blocks} lang={lang} />
            </div>
            <nav className={styles.nav} aria-label={t('lesson.progress')}>
              <Button
                variant="secondary"
                onClick={() => setStage(stage - 1)}
                disabled={stage === 0}
              >
                ← {t('lesson.previous')}
              </Button>
              <Button onClick={() => setStage(stage + 1)}>
                {stage === lesson.steps.length - 1
                  ? `${t('lesson.startQuiz')} →`
                  : `${t('lesson.next')} →`}
              </Button>
            </nav>
          </>
        )}
      </article>

      <ChatPanel world={lesson.world} />
    </main>
  );
}
