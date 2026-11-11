import { useTranslation } from 'react-i18next';
import { BitAvatar } from '@/components/ui/BitAvatar';
import { cx } from '@/lib/cx';
import { formatTime } from '@/lib/formatTime';
import { BOSS_HP, type Attack, type ConfusionState } from '../battle';
import type { Boss } from '../bosses';
import { BossMonster } from './BossMonster';
import styles from './BattleArena.module.css';

interface BattleArenaProps {
  boss: Boss;
  hp: number;
  timeLeft: number;
  timeLimit: number;
  /** The latest attack, shown as a lightning bolt and a damage number. `id` restarts the animation. */
  hit: (Attack & { id: number }) | null;
  monster: 'idle' | 'hit' | 'charge' | 'defeated';
  confusion: ConfusionState;
}

/** The top of a boss fight: HP bar, clock, and the boss walking towards the city. */
export function BattleArena({
  boss,
  hp,
  timeLeft,
  timeLimit,
  hit,
  monster,
  confusion,
}: BattleArenaProps) {
  const { t } = useTranslation();
  const name = t(`boss.bosses.${boss.id}.name`);
  // The boss starts far right and reaches the city (left) when the clock runs out.
  const progress = Math.min(1, Math.max(0, 1 - timeLeft / timeLimit));
  const bossLeft = 82 - progress * 62;
  const danger = progress > 0.75;

  return (
    <section className={cx(styles.arena, danger && styles.danger)} aria-label={t('boss.arena')}>
      <div className={styles.hud}>
        <div className={styles.hpBlock}>
          <span className={styles.name}>👾 {name}</span>
          <span
            className={styles.hpBar}
            role="progressbar"
            aria-label={t('boss.hpLabel', { name })}
            aria-valuemin={0}
            aria-valuemax={BOSS_HP}
            aria-valuenow={hp}
          >
            <span style={{ width: `${(hp / BOSS_HP) * 100}%` }} />
          </span>
          <span className={styles.hpText}>
            {hp} / {BOSS_HP} HP
          </span>
        </div>
        <p
          className={cx(styles.clock, timeLeft <= 15 && styles.clockLow)}
          role="timer"
          aria-label={t('boss.timeLeft', { time: formatTime(Math.max(0, timeLeft)) })}
        >
          ⏳ {formatTime(Math.max(0, Math.ceil(timeLeft)))}
        </p>
      </div>

      <div className={styles.track}>
        <div className={styles.city} aria-hidden="true">
          <svg viewBox="0 0 90 70" className={styles.skyline}>
            <rect x="4" y="26" width="22" height="44" fill="#165c40" />
            <rect x="30" y="8" width="28" height="62" fill="#1b6a4a" />
            <rect x="62" y="20" width="24" height="50" fill="#165c40" />
            <g fill="#f5b417">
              <rect x="9" y="32" width="6" height="6" />
              <rect x="36" y="16" width="7" height="7" />
              <rect x="46" y="30" width="7" height="7" />
              <rect x="68" y="28" width="6" height="6" />
            </g>
          </svg>
          <BitAvatar
            className={styles.bit}
            mood={monster === 'defeated' ? 'celebrating' : danger ? 'oops' : 'happy'}
          />
        </div>

        <div className={styles.road} aria-hidden="true" />

        {hit && (
          <span
            key={`beam-${hit.id}`}
            className={cx(styles.beam, hit.critical && styles.beamCritical)}
            style={{ width: `${bossLeft - 14}%` }}
            aria-hidden="true"
          />
        )}

        <div className={styles.boss} style={{ left: `${bossLeft}%` }}>
          <BossMonster boss={boss.id} state={monster} />
          {hit && (
            <span
              key={`dmg-${hit.id}`}
              className={cx(styles.damage, hit.critical && styles.critical)}
            >
              −{hit.damage}
              {hit.critical && <span className={styles.criticalText}>{t('boss.critical')}</span>}
            </span>
          )}
        </div>
      </div>

      <p className={styles.status} aria-live="assertive">
        {confusion === 'warning' && `⚠️ ${t('boss.confusionWarning', { name })}`}
        {confusion === 'confused' && `📺 ${t('boss.confused')}`}
      </p>
    </section>
  );
}
