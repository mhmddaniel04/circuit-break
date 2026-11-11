import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircuitDemo } from '@/components/learning/CircuitDemo';
import { applyGate, type Bit, type GateType } from '@/features/simulation';
import { cx } from '@/lib/cx';
import styles from './blocks.module.css';

const INPUT_NAMES = ['A', 'B'];

/** "Predict first": the student guesses the output before the bulb shows it. */
export function PredictBlock({ gate, inputs }: { gate: GateType; inputs: Bit[] }) {
  const { t } = useTranslation();
  const [guess, setGuess] = useState<Bit | null>(null);
  const output = applyGate(gate, inputs);
  const inputText = inputs.map((bit, i) => `${INPUT_NAMES[i]} = ${bit}`).join(', ');
  const right = guess === output;

  return (
    <section className={styles.predict} aria-label={t('lesson.predictTitle')}>
      <p className={styles.blockLabel}>🤔 {t('lesson.predictTitle')}</p>
      <p className={styles.predictQuestion}>
        {t('lesson.predictQuestion', { inputs: inputText, gate })}
      </p>
      <CircuitDemo gate={gate} inputs={inputs} hideOutput={guess === null} />

      <div className={styles.choices}>
        {([0, 1] as Bit[]).map((value) => (
          <button
            key={value}
            type="button"
            className={cx(
              styles.choice,
              guess !== null && value === output && styles.choiceRight,
              guess === value && !right && styles.choiceWrong,
            )}
            aria-pressed={guess === value}
            disabled={guess !== null}
            onClick={() => setGuess(value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {guess !== null && (
          <p className={cx(styles.feedback, right ? styles.feedbackRight : styles.feedbackWrong)}>
            <strong>{right ? `✓ ${t('lesson.correct')}` : `✗ ${t('lesson.wrong')}`}</strong>{' '}
            {t('lesson.predictReveal', { gate, inputs: inputText, output })}{' '}
            {t(`learn.gates.${gate}`)}
          </p>
        )}
      </div>
    </section>
  );
}
