import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { passMark, type Lesson } from '@/lessons';
import { cx } from '@/lib/cx';
import styles from './LessonQuiz.module.css';

interface LessonQuizProps {
  lesson: Lesson;
  lang: 'en' | 'ms';
  /** Called once when the student reaches the pass mark. */
  onPass: () => void;
  /** Shown on the result screen. */
  passedActions: ReactNode;
  onReview: () => void;
}

/** The quick check at the end of a lesson: one question at a time, with instant feedback. */
export function LessonQuiz({ lesson, lang, onPass, passedActions, onReview }: LessonQuizProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = lesson.quiz.length;
  const pass = passMark(lesson);
  const question = lesson.quiz[index];
  const isLast = index === total - 1;

  const choose = (option: number) => {
    if (chosen !== null) return;
    setChosen(option);
    if (option === question.answer) setCorrect((count) => count + 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setChosen(null);
      return;
    }
    setFinished(true);
    if (correct >= pass) onPass();
  };

  const restart = () => {
    setIndex(0);
    setChosen(null);
    setCorrect(0);
    setFinished(false);
  };

  if (finished) {
    const passed = correct >= pass;
    return (
      <section className={cx(styles.result, passed ? styles.passed : styles.failed)}>
        <p className={styles.resultIcon} aria-hidden="true">
          {passed ? '🎉' : '📖'}
        </p>
        <h2 className={styles.resultTitle}>
          {t(passed ? 'lesson.passedTitle' : 'lesson.failedTitle')}
        </h2>
        <p className={styles.resultText}>
          {passed
            ? t('lesson.passed', { correct, total, world: lesson.world })
            : t('lesson.failed', { correct, total, pass })}
        </p>
        <div className={styles.actions}>
          {passed ? (
            passedActions
          ) : (
            <>
              <Button variant="secondary" onClick={onReview}>
                {t('lesson.review')}
              </Button>
              <Button onClick={restart}>{t('lesson.retry')}</Button>
            </>
          )}
        </div>
      </section>
    );
  }

  const answered = chosen !== null;
  const right = chosen === question.answer;

  return (
    <section className={styles.quiz} aria-labelledby="question-text">
      <p className={styles.counter}>{t('lesson.question', { current: index + 1, total })}</p>
      <h2 id="question-text" className={styles.question}>
        {question.question[lang]}
      </h2>

      <div className={styles.options}>
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            className={cx(
              styles.option,
              answered && i === question.answer && styles.optionCorrect,
              answered && i === chosen && !right && styles.optionWrong,
            )}
            aria-pressed={i === chosen}
            disabled={answered}
            onClick={() => choose(i)}
          >
            {option[lang]}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {answered && (
          <div className={cx(styles.feedback, right ? styles.feedbackRight : styles.feedbackWrong)}>
            <p className={styles.feedbackTitle}>
              {right ? `✓ ${t('lesson.correct')}` : `✗ ${t('lesson.wrong')}`}
            </p>
            <p className={styles.feedbackText}>{question.explain[lang]}</p>
          </div>
        )}
      </div>

      {answered && (
        <div className={styles.actions}>
          <Button onClick={next}>
            {isLast ? t('lesson.seeResult') : `${t('lesson.nextQuestion')} →`}
          </Button>
        </div>
      )}
    </section>
  );
}
