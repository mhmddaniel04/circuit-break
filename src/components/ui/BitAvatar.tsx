import { cx } from '@/lib/cx';
import styles from './BitAvatar.module.css';

/** Bit, the game's robot tutor. Decorative: the text next to it says who is speaking. */
export function BitAvatar({ className }: { className?: string }) {
  return (
    <svg className={cx(styles.robot, className)} viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="4" x2="32" y2="14" className={styles.antenna} />
      <circle cx="32" cy="5" r="4" className={styles.light} />
      <rect x="10" y="14" width="44" height="36" rx="10" className={styles.head} />
      <circle cx="24" cy="30" r="5" className={styles.eye} />
      <circle cx="40" cy="30" r="5" className={styles.eye} />
      <path d="M24 41 Q32 46 40 41" className={styles.mouth} />
    </svg>
  );
}
