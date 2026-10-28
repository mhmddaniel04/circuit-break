import { cx } from '@/lib/cx';
import styles from './Stars.module.css';

interface StarsProps {
  /** How many stars are earned (0 to 3). */
  count: number;
  size?: 'small' | 'large';
  /** Pop the earned stars in one by one. */
  animated?: boolean;
  label: string;
}

export function Stars({ count, size = 'small', animated = false, label }: StarsProps) {
  return (
    <span className={cx(styles.stars, styles[size])} role="img" aria-label={label}>
      {[1, 2, 3].map((star) => (
        <span
          key={star}
          className={cx(styles.star, star <= count && styles.earned, animated && styles.animated)}
          style={animated ? { animationDelay: `${star * 0.2}s` } : undefined}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}
