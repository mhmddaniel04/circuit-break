import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { MAX_HINTS } from '../hintSchema';
import type { Hint } from '../useHints';
import styles from './HintPanel.module.css';

interface HintPanelProps {
  hints: Hint[];
  loading: boolean;
  failed: boolean;
  canAskMore: boolean;
  onAskMore: () => void;
}

/** Bit the robot, with the hints it has given so far. */
export function HintPanel({ hints, loading, failed, canAskMore, onAskMore }: HintPanelProps) {
  const { t } = useTranslation();

  return (
    <aside className={styles.panel} aria-live="polite">
      <svg className={styles.robot} viewBox="0 0 64 64" aria-hidden="true">
        <line x1="32" y1="4" x2="32" y2="14" className={styles.antenna} />
        <circle cx="32" cy="5" r="4" className={styles.light} />
        <rect x="10" y="14" width="44" height="36" rx="10" className={styles.head} />
        <circle cx="24" cy="30" r="5" className={styles.eye} />
        <circle cx="40" cy="30" r="5" className={styles.eye} />
        <path d="M24 41 Q32 46 40 41" className={styles.mouth} />
      </svg>

      <div className={styles.bubble}>
        <p className={styles.title}>{t('level.hintFrom')}</p>
        <ol className={styles.list}>
          {hints.map((hint, index) => (
            <li key={index} className={styles.hint}>
              <span className={styles.number}>{t('level.hintNumber', { number: index + 1 })}</span>
              {hint.text}
              {hint.source === 'fallback' && (
                <span className={styles.offline}> ({t('level.offlineHint')})</span>
              )}
            </li>
          ))}
        </ol>

        {loading && <p className={styles.thinking}>{t('level.thinking')}</p>}
        {failed && <p className={styles.error}>{t('level.hintError')}</p>}

        {!loading &&
          (canAskMore ? (
            <Button variant="secondary" onClick={onAskMore}>
              💡 {t('level.anotherHint', { used: hints.length, max: MAX_HINTS })}
            </Button>
          ) : (
            <p className={styles.noMore}>{t('level.noMoreHints')}</p>
          ))}
      </div>
    </aside>
  );
}