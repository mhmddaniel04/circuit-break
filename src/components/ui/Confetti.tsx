import styles from './Confetti.module.css';

const COLORS = ['#f5b417', '#1f7a55', '#f7efdb', '#e0662a', '#8ef0b5'];
const PIECES = 48;

/** A short burst of falling paper, used for a 3-star result. Hidden when the player prefers less motion. */
export function Confetti() {
  return (
    <div className={styles.confetti} aria-hidden="true" data-testid="confetti">
      {Array.from({ length: PIECES }, (_, i) => (
        <span
          key={i}
          className={styles.piece}
          style={{
            // Spread the pieces out without Math.random, so every render looks the same.
            left: `${(i * 37) % 100}%`,
            background: COLORS[i % COLORS.length],
            animationDelay: `${(i % 12) * 0.08}s`,
            animationDuration: `${1.6 + (i % 5) * 0.25}s`,
            transform: `rotate(${(i * 47) % 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
