import { cx } from '@/lib/cx';
import styles from './BitCharacter.module.css';

interface BitCharacterProps {
  className?: string;
  /** 'wave' on the home screen, 'cheer' (both arms up) when a level is solved. */
  pose?: 'wave' | 'cheer';
  label: string;
}

/** Bit's whole body, for the big moments: the home screen and the win screen. */
export function BitCharacter({ className, pose = 'wave', label }: BitCharacterProps) {
  const cheer = pose === 'cheer';
  return (
    <svg className={cx(styles.bit, className)} viewBox="0 0 220 300" role="img" aria-label={label}>
      <ellipse cx="110" cy="292" rx="62" ry="8" className={styles.shadow} />
      <line x1="110" y1="12" x2="110" y2="40" className={styles.outline} />
      <circle cx="110" cy="13" r="11" className={styles.light} />

      {cheer ? (
        <>
          <path d="M60 196 Q20 170 26 112" className={styles.arm} />
          <path d="M160 196 Q200 170 194 112" className={styles.arm} />
          <circle cx="26" cy="104" r="12" className={styles.hand} />
          <circle cx="194" cy="104" r="12" className={styles.hand} />
        </>
      ) : (
        <>
          <path d="M60 200 Q22 186 28 140" className={styles.arm} />
          <circle cx="28" cy="132" r="12" className={styles.hand} />
          <path d="M160 200 Q190 220 186 250" className={styles.arm} />
        </>
      )}

      <rect x="58" y="182" width="104" height="92" rx="22" className={styles.shade} />
      <rect x="58" y="174" width="104" height="92" rx="22" className={styles.body} />
      <rect x="84" y="198" width="52" height="34" rx="8" className={styles.panel} />
      <circle cx="98" cy="215" r="6" className={styles.panelLight} />
      <circle cx="122" cy="215" r="6" className={styles.panelLightOff} />

      <rect x="30" y="50" width="160" height="124" rx="34" className={styles.shade} />
      <rect x="30" y="40" width="160" height="124" rx="34" className={styles.body} />
      <rect x="52" y="64" width="116" height="74" rx="20" className={styles.screen} />
      {cheer ? (
        <>
          <path d="M72 104 l14 -14 l14 14 M120 104 l14 -14 l14 14" className={styles.line} />
          <path d="M88 116 Q110 140 132 116 Z" className={styles.eye} />
        </>
      ) : (
        <>
          <circle cx="86" cy="98" r="13" className={styles.eye} />
          <circle cx="134" cy="98" r="13" className={styles.eye} />
          <path d="M88 122 Q110 136 132 122" className={styles.line} />
        </>
      )}

      <rect x="76" y="266" width="22" height="26" rx="6" className={styles.leg} />
      <rect x="122" y="266" width="22" height="26" rx="6" className={styles.leg} />
    </svg>
  );
}
