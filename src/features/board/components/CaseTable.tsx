import { useTranslation } from 'react-i18next';
import type { CheckResult } from '@/features/simulation';
import type { Level } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './CaseTable.module.css';

interface CaseTableProps {
  level: Level;
  result: CheckResult;
  viewedCase: number;
  onView: (index: number) => void;
}

/** Truth-table results after "Test Circuit". Click a row to see that case on the board. */
export function CaseTable({ level, result, viewedCase, onView }: CaseTableProps) {
  const { t } = useTranslation();
  if (result.cases.length < 2) return null;

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>{t('level.truthTable')}</caption>
        <thead>
          <tr>
            {level.sources.map((source) => (
              <th key={source.id} scope="col">
                {source.id}
              </th>
            ))}
            {level.bulbs.map((bulb) => (
              <th key={bulb.id} scope="col">
                {bulb.id}
              </th>
            ))}
            <th scope="col">{t('level.result')}</th>
          </tr>
        </thead>
        <tbody>
          {result.cases.map((testCase, index) => (
            <tr
              key={index}
              className={cx(styles.row, index === viewedCase && styles.viewed)}
              onClick={() => onView(index)}
            >
              {level.sources.map((source) => (
                <td key={source.id}>{testCase.inputs[source.id]}</td>
              ))}
              {testCase.bulbs.map((bulb) => (
                <td key={bulb.id}>
                  {bulb.actual ?? '–'}
                  {!bulb.correct && (
                    <span className={styles.expected}>
                      {' '}
                      ({t('level.needs', { value: bulb.expected })})
                    </span>
                  )}
                </td>
              ))}
              <td>
                <button
                  type="button"
                  className={cx(styles.status, testCase.passed ? styles.pass : styles.fail)}
                  aria-label={t('level.showCase', { number: index + 1 })}
                  onClick={(event) => {
                    event.stopPropagation();
                    onView(index);
                  }}
                >
                  {testCase.passed ? '✓' : '✗'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
