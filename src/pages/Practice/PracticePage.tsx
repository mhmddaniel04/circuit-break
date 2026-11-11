import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import {
  CircuitDiagram,
  columnExpression,
  createRandom,
  DIFFICULTIES,
  Expression,
  generateQuestion,
  outputExpression,
  solveQuestion,
  type Difficulty,
} from '@/features/practice';
import { rewardPracticeSolved } from '@/features/rewards';
import type { Bit } from '@/features/simulation';
import { cx } from '@/lib/cx';
import styles from './PracticePage.module.css';

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/** SPM-style practice: complete the truth table of a random circuit, with a worked answer. */
export default function PracticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [seed, setSeed] = useState(newSeed);
  const [number, setNumber] = useState(1);
  const [solved, setSolved] = useState(0);

  const next = (level = difficulty) => {
    setDifficulty(level);
    setSeed(newSeed());
    setNumber((count) => count + 1);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/learn')}>
          ← {t('practice.back')}
        </Button>
        <h1 className={styles.title}>{t('practice.title')}</h1>
        <p className={styles.score}>{t('practice.solved', { count: solved })}</p>
      </header>
      <p className={styles.intro}>{t('practice.intro')}</p>

      <div className={styles.levels} role="group" aria-label={t('practice.difficulty')}>
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            type="button"
            className={cx(styles.level, level === difficulty && styles.levelActive)}
            aria-pressed={level === difficulty}
            onClick={() => next(level)}
          >
            {t(`practice.levels.${level}`)}
          </button>
        ))}
      </div>

      <QuestionCard
        key={`${difficulty}-${seed}`}
        difficulty={difficulty}
        seed={seed}
        number={number}
        onSolved={() => {
          setSolved((count) => count + 1);
          rewardPracticeSolved();
        }}
        onNext={() => next()}
      />
    </main>
  );
}

interface QuestionCardProps {
  difficulty: Difficulty;
  seed: number;
  number: number;
  onSolved: () => void;
  onNext: () => void;
}

function QuestionCard({ difficulty, seed, number, onSolved, onNext }: QuestionCardProps) {
  const { t } = useTranslation();
  const [question] = useState(() => generateQuestion(difficulty, createRandom(seed)));
  const rows = solveQuestion(question);
  const [answers, setAnswers] = useState<(Bit | null)[][]>(() =>
    rows.map(() => question.columns.map(() => null)),
  );
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [counted, setCounted] = useState(false);

  const wrong = rows.reduce(
    (sum, row, r) => sum + row.outputs.filter((value, c) => answers[r][c] !== value).length,
    0,
  );
  const complete = answers.every((row) => row.every((value) => value !== null));

  // Each tap goes ? → 0 → 1 → 0 → …
  const cycle = (r: number, c: number) => {
    setChecked(false);
    setAnswers((current) =>
      current.map((row, ri) =>
        ri !== r ? row : row.map((value, ci) => (ci !== c ? value : value === 0 ? 1 : 0)),
      ),
    );
  };

  const check = () => {
    setChecked(true);
    if (wrong === 0 && !counted) {
      setCounted(true);
      onSolved();
    }
  };

  const reveal = () => {
    setRevealed(true);
    setCounted(true);
    setAnswers(rows.map((row) => [...row.outputs]));
  };

  return (
    <article className={styles.card}>
      <p className={styles.number}>{t('practice.question', { number })}</p>
      <h2 className={styles.prompt}>{t('practice.prompt')}</h2>

      <div className={styles.diagram}>
        <CircuitDiagram question={question} />
      </div>
      <p className={styles.expression}>
        <span className={styles.expressionLabel}>{t('practice.expression')}</span>{' '}
        <Expression name="Y" tokens={outputExpression(question)} />
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.caption}>{t('practice.tableCaption')}</caption>
          <thead>
            <tr>
              {question.inputs.map((name) => (
                <th key={name} scope="col">
                  {name}
                </th>
              ))}
              {question.columns.map((column) => (
                <th key={column.name} scope="col" className={styles.answerHead}>
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => {
              const inputText = row.inputs
                .map((bit, i) => `${question.inputs[i]} = ${bit}`)
                .join(', ');
              return (
                <tr key={r}>
                  {row.inputs.map((bit, i) => (
                    <td key={i}>{bit}</td>
                  ))}
                  {question.columns.map((column, c) => {
                    const value = answers[r][c];
                    const right = value === row.outputs[c];
                    return (
                      <td
                        key={column.name}
                        className={cx(
                          checked && !revealed && (right ? styles.cellRight : styles.cellWrong),
                        )}
                      >
                        <button
                          type="button"
                          className={styles.cell}
                          disabled={revealed}
                          aria-label={t('practice.cell', {
                            column: column.name,
                            inputs: inputText,
                            value: value ?? t('lesson.notSet'),
                          })}
                          onClick={() => cycle(r, c)}
                        >
                          {value ?? '?'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className={styles.result} aria-live="polite">
        {checked &&
          !revealed &&
          (wrong === 0 ? `🎉 ${t('practice.allCorrect')}` : t('practice.wrong', { count: wrong }))}
      </p>

      <div className={styles.actions}>
        {!revealed && (
          <>
            <Button variant="secondary" onClick={reveal}>
              {t('practice.showAnswer')}
            </Button>
            <Button variant="secondary" disabled={!complete} onClick={check}>
              {t('practice.check')}
            </Button>
          </>
        )}
        <Button onClick={onNext}>{t('practice.next')} →</Button>
      </div>

      {(revealed || (checked && wrong === 0)) && (
        <section className={styles.worked} aria-labelledby="worked-title">
          <h3 id="worked-title" className={styles.workedTitle}>
            {t('practice.worked')}
          </h3>
          <ol className={styles.steps}>
            {question.columns.map((column) => (
              <li key={column.name}>
                <Expression name={column.name} tokens={columnExpression(column)} />{' '}
                <span className={styles.gateTag}>{column.gate}</span>{' '}
                {t(`learn.gates.${column.gate}`)}
              </li>
            ))}
          </ol>
          <p className={styles.workedTip}>{t('practice.workedTip')}</p>
        </section>
      )}
    </article>
  );
}
