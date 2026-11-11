import { useTranslation } from 'react-i18next';
import { getTestCases, type CheckResult } from '@/features/simulation';
import type { Level } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './CaseTable.module.css';

interface CaseTableProps {
  level: Level;
  /** The last test, or null before the first test. */
  result: CheckResult | null;
  viewedCase: number;
  onView: (index: number) => void;
}

/**
 * The level's truth table: what each bulb must show for every row, and after a test, what the
 * player's circuit gave. Click a row to see it on the board.
 */
export function CaseTable({ level, result, viewedCase, onView }: CaseTableProps) {
  const { t } = useTranslation();
  const cases = getTestCases(level);
  if (cases.length < 2) return null;

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
              <th key={`${bulb.id}-goal`} scope="col">
                {t('level.goalColumn', { bulb: bulb.id })}
              </th>
            ))}
            {level.bulbs.map((bulb) => (
              <th key={`${bulb.id}-yours`} scope="col">
                {t('level.yoursColumn', { bulb: bulb.id })}
              </th>
            ))}
            <th scope="col">
              <span className={styles.srOnly}>{t('level.result')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((testCase, index) => {
            const tested = result?.cases[index];
            return (
              <tr
                key={index}
                className={cx(styles.row, index === viewedCase && styles.viewed)}
                onClick={() => onView(index)}
              >
                {level.sources.map((source) => (
                  <td key={source.id}>{testCase.inputs[source.id]}</td>
                ))}
                {level.bulbs.map((bulb) => (
                  <td key={`${bulb.id}-goal`} className={styles.goal}>
                    {testCase.targets[bulb.id]}
                  </td>
                ))}
                {level.bulbs.map((bulb) => {
                  const actual = tested?.bulbs.find((b) => b.id === bulb.id);
                  return (
                    <td
                      key={`${bulb.id}-yours`}
                      className={cx(actual && !actual.correct && styles.wrongValue)}
                    >
                      {actual ? (actual.actual ?? '–') : '·'}
                    </td>
                  );
                })}
                <td>
                  <button
                    type="button"
                    className={cx(
                      styles.status,
                      tested && (tested.passed ? styles.pass : styles.fail),
                    )}
                    aria-label={t('level.showCase', { number: index + 1 })}
                    onClick={(event) => {
                      event.stopPropagation();
                      onView(index);
                    }}
                  >
                    {tested ? (tested.passed ? '✓' : '✗') : '→'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
