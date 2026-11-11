import { cx } from '@/lib/cx';
import styles from './BitAvatar.module.css';

export type BitMood = 'happy' | 'thinking' | 'celebrating' | 'oops' | 'explaining';

interface BitAvatarProps {
  className?: string;
  /** Bit's face tells students how they are doing before they read a word. */
  mood?: BitMood;
}

/** Bit's head, the game's robot tutor. Decorative: the text next to it says who is speaking. */
export function BitAvatar({ className, mood = 'happy' }: BitAvatarProps) {
  return (
    <svg
      className={cx(styles.robot, className)}
      viewBox="0 0 64 64"
      aria-hidden="true"
      data-mood={mood}
    >
      <line x1="32" y1="4" x2="32" y2="13" className={styles.antenna} />
      <circle
        cx="32"
        cy="5"
        r="4"
        className={cx(styles.light, mood === 'oops' && styles.lightOops)}
      />
      {/* The darker shape under the head gives Bit a little depth (2.5D). */}
      <rect x="8" y="17" width="48" height="40" rx="12" className={styles.shade} />
      <rect x="8" y="13" width="48" height="40" rx="12" className={styles.head} />
      <rect x="15" y="20" width="34" height="26" rx="8" className={styles.screen} />
      <Face mood={mood} />
    </svg>
  );
}

/** Eyes and mouth on Bit's screen, drawn around the screen centre (32, 33). */
function Face({ mood }: { mood: BitMood }) {
  switch (mood) {
    case 'thinking':
      return (
        <g className={styles.face}>
          <circle cx="25" cy="31" r="4" className={styles.eye} />
          <circle cx="39" cy="31" r="4" className={styles.eye} />
          <circle cx="26.5" cy="29" r="1.6" className={styles.pupil} />
          <circle cx="40.5" cy="29" r="1.6" className={styles.pupil} />
          <path d="M27 40 H37" className={styles.mouth} />
        </g>
      );
    case 'celebrating':
      return (
        <g className={styles.face}>
          <path d="M21 32 l4 -4 l4 4 M35 32 l4 -4 l4 4" className={styles.mouth} />
          <path d="M25 37 Q32 45 39 37 Z" className={styles.eye} />
        </g>
      );
    case 'oops':
      return (
        <g className={styles.face}>
          <circle cx="25" cy="32" r="3.5" className={styles.eye} />
          <circle cx="39" cy="32" r="3.5" className={styles.eye} />
          <path d="M20 26 l6 2 M44 26 l-6 2" className={styles.mouth} />
          <path d="M26 41 q3 -3 6 0 q3 3 6 0" className={styles.mouth} />
        </g>
      );
    case 'explaining':
      return (
        <g className={styles.face}>
          <circle cx="25" cy="31" r="4" className={styles.eye} />
          <path d="M35 31 H43" className={styles.mouth} />
          <path d="M25 39 Q32 43 39 38" className={styles.mouth} />
        </g>
      );
    case 'happy':
      return (
        <g className={styles.face}>
          <circle cx="25" cy="31" r="4" className={styles.eye} />
          <circle cx="39" cy="31" r="4" className={styles.eye} />
          <path d="M26 39 Q32 43 38 39" className={styles.mouth} />
        </g>
      );
  }
}
