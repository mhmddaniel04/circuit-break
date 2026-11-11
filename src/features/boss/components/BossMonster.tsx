import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import type { Boss } from '../bosses';
import styles from './BossMonster.module.css';

interface BossMonsterProps {
  boss: Boss['id'];
  /** 'hit' flashes and shakes; 'defeated' falls over; 'charge' leans forward. */
  state?: 'idle' | 'hit' | 'charge' | 'defeated';
  className?: string;
}

/** The district boss: a "glitch" monster drawn in the game's 2.5D style. Decorative. */
export function BossMonster({ boss, state = 'idle', className }: BossMonsterProps) {
  return (
    <svg
      className={cx(styles.monster, styles[state], className)}
      viewBox="0 0 160 170"
      aria-hidden="true"
      data-boss={boss}
    >
      <ellipse cx="80" cy="162" rx="48" ry="7" className={styles.shadow} />
      <g className={styles.body}>{BODIES[boss]}</g>
    </svg>
  );
}

/** Angry eyes and a toothy grin, shared by all bosses. */
function Face({ y = 70, eyeColor = '#ff3b3b' }: { y?: number; eyeColor?: string }) {
  return (
    <g>
      <path d={`M48 ${y - 14} l22 8 M112 ${y - 14} l-22 8`} className={styles.brow} />
      <circle cx="60" cy={y} r="9" fill={eyeColor} className={styles.eye} />
      <circle cx="100" cy={y} r="9" fill={eyeColor} className={styles.eye} />
      <path
        d={`M54 ${y + 22} Q80 ${y + 36} 106 ${y + 22} L100 ${y + 30} L92 ${y + 24} L86 ${y + 32} L80 ${y + 25} L74 ${y + 32} L68 ${y + 24} L60 ${y + 30} Z`}
        className={styles.mouth}
      />
    </g>
  );
}

const BODIES: Record<Boss['id'], ReactNode> = {
  // District 1: a broken light bulb that flickers.
  flicker: (
    <g>
      <rect x="62" y="122" width="36" height="26" rx="4" fill="#7b828b" />
      <path d="M62 130 H98 M62 138 H98" stroke="#4c5157" strokeWidth="4" />
      <circle cx="80" cy="72" r="58" fill="#c7a52a" />
      <circle cx="80" cy="66" r="58" fill="#f5d34a" className={styles.flicker} />
      <path d="M68 104 q12 -18 24 0" fill="none" stroke="#a87b00" strokeWidth="4" />
      <path
        d="M38 40 l12 10 M122 40 l-12 10"
        stroke="#fff6c9"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Face y={62} eyeColor="#c62828" />
    </g>
  ),
  // District 2: a padlock with jaws ("both keys needed", like AND).
  lockjaw: (
    <g>
      <path d="M46 70 V48 a34 34 0 0 1 68 0 V70" fill="none" stroke="#5d6670" strokeWidth="14" />
      <rect x="22" y="72" width="116" height="84" rx="20" fill="#7a5a12" />
      <rect x="22" y="64" width="116" height="84" rx="20" fill="#c79a2a" />
      <circle cx="80" cy="132" r="8" fill="#3d2c08" />
      <rect x="77" y="134" width="6" height="12" fill="#3d2c08" />
      <Face y={92} />
    </g>
  ),
  // District 3: a ball of lightning (sparks everywhere, like OR).
  sparkstorm: (
    <g>
      <path
        d="M80 6 l10 26 l26 -14 l-8 28 l30 2 l-24 18 l22 20 l-30 0 l6 30 l-26 -18 l-14 28 l-8 -30 l-28 12 l10 -28 l-28 -8 l26 -16 l-16 -26 l30 8 z"
        fill="#ffb300"
        className={styles.flicker}
      />
      <circle cx="80" cy="80" r="46" fill="#7b2ff7" />
      <circle cx="80" cy="74" r="46" fill="#a259ff" />
      <Face y={72} eyeColor="#fff6c9" />
    </g>
  ),
  // District 4: a glitchy TV that casts confusion.
  static: (
    <g>
      <path
        d="M58 20 L78 46 M106 14 L84 46"
        stroke="#4c5157"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="18" y="52" width="124" height="100" rx="18" fill="#2b2f36" />
      <rect x="18" y="44" width="124" height="100" rx="18" fill="#4a505a" />
      <rect x="32" y="58" width="96" height="72" rx="10" fill="#b8c2cc" />
      <g className={styles.noise}>
        <rect x="32" y="66" width="96" height="6" fill="#ffffff" opacity="0.6" />
        <rect x="32" y="88" width="96" height="4" fill="#5a6470" opacity="0.6" />
        <rect x="32" y="110" width="96" height="6" fill="#ffffff" opacity="0.5" />
      </g>
      <Face y={88} eyeColor="#1f7a55" />
      <rect x="40" y="144" width="14" height="14" rx="3" fill="#2b2f36" />
      <rect x="106" y="144" width="14" height="14" rx="3" fill="#2b2f36" />
    </g>
  ),
  // District 5: a giant evil chip, the final boss.
  overload: (
    <g>
      <g fill="#c7cdd3">
        {[40, 62, 84, 106].map((y) => (
          <g key={y}>
            <rect x="4" y={y} width="20" height="10" rx="2" />
            <rect x="136" y={y} width="20" height="10" rx="2" />
          </g>
        ))}
      </g>
      <rect x="20" y="32" width="120" height="124" rx="16" fill="#0a0a0a" />
      <rect x="20" y="24" width="120" height="124" rx="16" fill="#2b2b2b" />
      <circle cx="36" cy="40" r="6" fill="#171717" />
      <path d="M40 132 H120" stroke="#ff3b3b" strokeWidth="4" className={styles.flicker} />
      <Face y={78} />
    </g>
  ),
};
