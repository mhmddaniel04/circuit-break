import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ACHIEVEMENTS } from '../achievements';
import { usePlayerStore } from '../playerStore';
import styles from './RewardToasts.module.css';

const SHOW_FOR_MS = 4000;

/** Pop-ups for badges and new ranks earned outside a level (lessons, practice, chat). */
export function RewardToasts() {
  const { t } = useTranslation();
  const toast = usePlayerStore((state) => state.toasts[0]);
  const dismiss = usePlayerStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismiss, SHOW_FOR_MS);
    return () => window.clearTimeout(timer);
  }, [toast, dismiss]);

  return (
    <div className={styles.region} aria-live="polite">
      {toast && (
        <button type="button" className={styles.toast} onClick={dismiss}>
          <span className={styles.icon} aria-hidden="true">
            {toast.kind === 'achievement'
              ? ACHIEVEMENTS.find((achievement) => achievement.id === toast.id)?.icon
              : '⬆️'}
          </span>
          <span className={styles.text}>
            <span className={styles.label}>
              {t(toast.kind === 'achievement' ? 'rewards.unlocked' : 'rewards.rankUp')}
            </span>
            <span className={styles.title}>
              {toast.kind === 'achievement'
                ? t(`rewards.achievements.${toast.id}.title`)
                : t(`rewards.ranks.${toast.rank}`)}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
