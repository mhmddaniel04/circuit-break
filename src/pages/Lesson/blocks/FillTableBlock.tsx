import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { GATE_ARITY, truthTable, type Bit, type GateType } from '@/features/simulation';
import { cx } from '@/lib/cx';
import styles from './blocks.module.css';

const INPUT_NAMES = ['A', 'B'];

/** A truth table with the output column left blank for the student to fill in. */
export function FillTableBlock({ gate }: { gate: GateType }) {
  const { t } = useTranslation();
  const rows = truthTable(gate);
  const arity = GATE_ARITY[gate];
  const [answers, setAnswers] = useState<(Bit | null)[]>(rows.map(() => null));
  const [checked, setChecked] = useState(false);

  const wrong = rows.filter((row, i) => answers[i] !== row.output).length;
  const complete = answers.every((answer) => answer !== null);

  // Each tap goes ? → 0 → 1 → 0 → …
  const cycle = (index: number) => {
    setChecked(false);
    setAnswers((current) =>
      current.map((answer, i) => (i === index ? (answer === 0 ? 1 : 0) : answer)),
    );
  };

  return (
    <section className={styles.fill} aria-label={t('lesson.fillTitle', { gate })}>
      <p className={styles.blockLabel}>✏️ {t('lesson.fillTitle', { gate })}</p>
      <p className={styles.fillHelp}>{t('lesson.fillHelp')}</p>

      <table className={styles.table}>
        <thead>
          <tr>
            {INPUT_NAMES.slice(0, arity).map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
            <th scope="col">Y</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const answer = answers[index];
            const inputs = row.inputs.map((bit, i) => `${INPUT_NAMES[i]} = ${bit}`).join(', ');
            const isRight = answer === row.output;
            return (
              <tr
                key={row.inputs.join('')}
                className={cx(checked && (isRight ? styles.rowRight : styles.rowWrong))}
              >
                {row.inputs.map((bit, i) => (
                  <td key={i}>{bit}</td>
                ))}
                <td>
                  <button
                    type="button"
                    className={styles.cell}
                    aria-label={t('lesson.fillCell', {
                      inputs,
                      value: answer ?? t('lesson.notSet'),
                    })}
                    onClick={() => cycle(index)}
                  >
                    {answer ?? '?'}
                  </button>
                  {checked && (
                    <span className={styles.mark} aria-hidden="true">
                      {isRight ? '✓' : '✗'}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.fillFooter}>
        <Button variant="secondary" disabled={!complete} onClick={() => setChecked(true)}>
          {t('lesson.fillCheck')}
        </Button>
        <p className={styles.fillResult} aria-live="polite">
          {checked &&
            (wrong === 0
              ? `🎉 ${t('lesson.fillPerfect')}`
              : t('lesson.fillWrong', { count: wrong }))}
        </p>
      </div>
    </section>
  );
}
