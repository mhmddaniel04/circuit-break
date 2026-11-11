import { useTranslation } from 'react-i18next';
import { BitAvatar } from '@/components/ui/BitAvatar';
import { Button } from '@/components/ui/Button';
import type { Hint } from '../useHints';
import styles from './HintPanel.module.css';

interface HintPanelProps {
  hints: Hint[];
  loading: boolean;
  canAskMore: boolean;
  /** Coins the next hint costs, and whether the player has that many. */
  nextCost: number;
  canAfford: boolean;
  onAskMore: () => void;
}

/** Bit the robot, with the hints it has given so far. */
export function HintPanel({
  hints,
  loading,
  canAskMore,
  nextCost,
  canAfford,
  onAskMore,
}: HintPanelProps) {
  const { t } = useTranslation();

  return (
    <aside className={styles.panel} aria-live="polite">
      <BitAvatar mood={loading ? 'thinking' : 'explaining'} />

      <div className={styles.bubble}>
        <p className={styles.title}>{t('level.hintFrom')}</p>
        <ol className={styles.list}>
          {hints.map((hint, index) => (
            <li key={index} className={styles.hint}>
              <span className={styles.number}>{t('level.hintNumber', { number: index + 1 })}</span>
              {hint.text}
            </li>
          ))}
        </ol>

        {loading && <p className={styles.thinking}>{t('level.thinking')}</p>}

        {!loading &&
          (canAskMore ? (
            <>
              <Button variant="secondary" onClick={onAskMore} disabled={!canAfford}>
                💡 {t('level.anotherHint', { cost: nextCost })}
              </Button>
              {!canAfford && <p className={styles.error}>{t('level.notEnoughCoins')}</p>}
            </>
          ) : (
            <p className={styles.noMore}>{t('level.noMoreHints')}</p>
          ))}
      </div>
    </aside>
  );
}
