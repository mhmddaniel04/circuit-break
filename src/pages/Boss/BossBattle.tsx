import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BitCharacter } from '@/components/ui/BitCharacter';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { Stars } from '@/components/ui/Stars';
import { Board, Toolbox, useBoard } from '@/features/board';
import {
  attackFor,
  BattleArena,
  battleRounds,
  battleStars,
  battleTimeLimit,
  BOSS_HP,
  BossMonster,
  confusionAt,
  getBoss,
  WRONG_TEST_PENALTY,
  type Attack,
} from '@/features/boss';
import { useProgressStore } from '@/features/progress';
import { RewardSummary, rewardLevelSolved, type RewardResult } from '@/features/rewards';
import type { Stars as StarCount } from '@/features/scoring';
import { useSettingsStore } from '@/features/settings';
import { checkSolution } from '@/features/simulation';
import { getLevelsByWorld, type Level } from '@/levels';
import { formatTime } from '@/lib/formatTime';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { RowStrip, messageText } from '../Level/LevelView';
import { useLevelSounds } from '../Level/useLevelSounds';
import styles from './BossBattle.module.css';

type Status = 'intro' | 'fight' | 'won' | 'lost';

interface Win {
  stars: StarCount;
  timeLeft: number;
  reward: RewardResult;
}

/**
 * A boss fight: solve circuits to attack before the boss walks into the city. Faster solves hit
 * harder; wrong tests let it charge closer; the last two bosses hide your chips for a moment.
 */
export function BossBattle({ world, onRestart }: { world: number; onRestart: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const boss = getBoss(world)!;
  const rounds = battleRounds(world);
  const timeLimit = battleTimeLimit(boss);
  const bossLevel = rounds[rounds.length - 1];
  const recordResult = useProgressStore((state) => state.recordResult);
  const lang = i18n.language === 'ms' ? 'ms' : 'en';

  const [status, setStatus] = useState<Status>('intro');
  const [hp, setHp] = useState(BOSS_HP);
  const [round, setRound] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [roundStartedAt, setRoundStartedAt] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [wrongTests, setWrongTests] = useState(0);
  const [now, setNow] = useState(0);
  const [hit, setHit] = useState<(Attack & { id: number }) | null>(null);
  const [monster, setMonster] = useState<'idle' | 'hit' | 'charge' | 'defeated'>('idle');
  const [attacking, setAttacking] = useState(false);
  const [win, setWin] = useState<Win | null>(null);
  const timers = useRef<number[]>([]);

  const fightSeconds = status === 'fight' ? Math.max(0, (now - startedAt) / 1000) : 0;
  const timeLeft = status === 'intro' ? timeLimit : timeLimit - fightSeconds - penalty;
  const confusion = status === 'fight' && !attacking ? confusionAt(fightSeconds, boss) : 'clear';
  const level = rounds[round % rounds.length];

  const later = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  // The clock: ticks while fighting, and the boss wins when it reaches zero.
  useEffect(() => {
    if (status !== 'fight') return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [status]);
  useEffect(() => {
    if (status === 'fight' && timeLeft <= 0 && hp > 0) {
      setStatus('lost');
      setMonster('charge');
    }
  }, [status, timeLeft, hp]);

  const start = () => {
    const time = Date.now();
    setStartedAt(time);
    setRoundStartedAt(time);
    setNow(time);
    setStatus('fight');
  };

  const handleTest = (solved: boolean) => {
    if (!solved) {
      setPenalty((seconds) => seconds + WRONG_TEST_PENALTY);
      setWrongTests((count) => count + 1);
      setMonster('charge');
      later(650, () => setMonster('idle'));
      return;
    }

    const attack = attackFor((Date.now() - roundStartedAt) / 1000, level.par.seconds);
    const newHp = Math.max(0, hp - attack.damage);
    setHit({ ...attack, id: Date.now() });
    setHp(newHp);
    setMonster('hit');
    setAttacking(true);

    if (newHp === 0) {
      later(900, () => finish());
      return;
    }
    later(1300, () => {
      setRound((count) => count + 1);
      setRoundStartedAt(Date.now());
      setMonster('idle');
      setAttacking(false);
    });
  };

  /** The boss is down: save the result like a solved level, with the boss bonus. */
  const finish = () => {
    const seconds = Math.round((Date.now() - startedAt) / 1000 + penalty);
    const left = Math.max(0, timeLimit - seconds);
    const stars = battleStars(left, timeLimit);
    const previous = useProgressStore.getState().levels[bossLevel.id];
    recordResult(bossLevel.id, {
      stars,
      score: Math.max(100, 1000 + left * 5 - wrongTests * 100),
      seconds,
    });
    const reward = rewardLevelSolved({
      levelId: bossLevel.id,
      previous,
      stars,
      attempts: wrongTests + 1,
      seconds,
      parSeconds: timeLimit,
      hintsBought: 0,
      bossInTime: true,
    });
    setMonster('defeated');
    setWin({ stars, timeLeft: left, reward });
    setStatus('won');
  };

  const name = t(`boss.bosses.${boss.id}.name`);
  const nextDistrict = getLevelsByWorld(world + 1)[0];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/worlds')}>
          ← {t('level.back')}
        </Button>
        <div className={styles.titleBlock}>
          <p className={styles.kicker}>{t('boss.kicker', { world })}</p>
          <h1 className={styles.title}>{name}</h1>
        </div>
      </header>

      {status === 'intro' ? (
        <section className={styles.intro} aria-labelledby="boss-intro">
          <BossMonster boss={boss.id} className={styles.introMonster} />
          <div className={styles.introText}>
            <h2 id="boss-intro" className={styles.introTitle}>
              {t('boss.introTitle', { name })}
            </h2>
            <p className={styles.taunt}>“{t(`boss.bosses.${boss.id}.taunt`)}”</p>
            <ul className={styles.rules}>
              <li>⚡ {t('boss.ruleAttack', { hp: BOSS_HP })}</li>
              <li>💥 {t('boss.ruleCritical')}</li>
              <li>
                ⏳{' '}
                {t('boss.ruleClock', { time: formatTime(timeLimit), seconds: WRONG_TEST_PENALTY })}
              </li>
              {boss.confusion && (
                <li>📺 {t('boss.ruleConfusion', { seconds: boss.confusion.hide })}</li>
              )}
              <li>🚫 {t('boss.ruleNoHints')}</li>
            </ul>
            <Button className={styles.fight} onClick={start}>
              ⚔️ {t('boss.fight')}
            </Button>
          </div>
        </section>
      ) : (
        <>
          <BattleArena
            boss={boss}
            hp={hp}
            timeLeft={timeLeft}
            timeLimit={timeLimit}
            hit={hit}
            monster={monster}
            confusion={confusion}
          />
          {status === 'fight' && (
            <RoundBoard
              key={round}
              level={level}
              round={round}
              hideGates={confusion === 'confused'}
              disabled={attacking}
              title={level.title[lang]}
              onTest={handleTest}
            />
          )}
        </>
      )}

      {status === 'won' && win && (
        <div className={styles.overlay}>
          {win.stars === 3 && <Confetti />}
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="won">
            <BitCharacter className={styles.dialogBit} pose="cheer" label={t('level.bitCheer')} />
            <h2 id="won" className={styles.dialogTitle}>
              {t('boss.won', { name })}
            </h2>
            <Stars
              count={win.stars}
              size="large"
              animated
              label={t('level.starsLabel', { count: win.stars })}
            />
            <p className={styles.dialogText}>
              {t('boss.wonText', { time: formatTime(win.timeLeft) })}
            </p>
            <RewardSummary result={win.reward} />
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={onRestart}>
                {t('boss.again')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/worlds')}>
                {t('level.worldMap')}
              </Button>
              {nextDistrict && (
                <Button onClick={() => navigate(`/level/${nextDistrict.id}`)}>
                  {t('boss.nextDistrict')} →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {status === 'lost' && (
        <div className={styles.overlay}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="lost">
            <BossMonster boss={boss.id} className={styles.lostMonster} />
            <h2 id="lost" className={styles.dialogTitle}>
              {t('boss.lost', { name })}
            </h2>
            <p className={styles.dialogText}>{t('boss.lostText', { hp })}</p>
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={() => navigate('/worlds')}>
                {t('level.worldMap')}
              </Button>
              <Button onClick={onRestart}>⚔️ {t('boss.retry')}</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

interface RoundBoardProps {
  level: Level;
  round: number;
  hideGates: boolean;
  /** True while the attack plays, between two circuits. */
  disabled: boolean;
  title: string;
  onTest: (solved: boolean) => void;
}

/** One circuit of the fight. A new one is mounted for every round. */
function RoundBoard({ level, round, hideGates, disabled, title, onTest }: RoundBoardProps) {
  const { t } = useTranslation();
  const { state, dispatch, evaluation } = useBoard(level);
  const colorBlind = useSettingsStore((settings) => settings.colorBlind);
  useLevelSounds(state);

  const test = () => {
    if (disabled) return;
    dispatch({ type: 'test' });
    const result = checkSolution(level, state.placement);
    // Empty slots are not a wrong answer: the board just asks to fill them.
    if (result.emptySlots.length > 0) return;
    onTest(result.solved);
  };

  useKeyboardShortcuts(
    {
      ...Object.fromEntries(
        level.toolbox.map(({ gate }, index) => [
          String(index + 1),
          () => dispatch({ type: 'selectGate', gate }),
        ]),
      ),
      t: test,
      z: () => dispatch({ type: 'undo' }),
    },
    !disabled,
  );

  return (
    <>
      <div className={styles.roundBar}>
        <span className={styles.roundTag}>{t('boss.round', { number: round + 1 })}</span>
        <span className={styles.roundTitle}>{title}</span>
      </div>
      {(level.cases?.length ?? 0) > 1 && (
        <RowStrip level={level} index={state.viewedCase} result={state.result} />
      )}
      <section className={styles.boardCard}>
        <Board
          level={level}
          placement={state.placement}
          evaluation={evaluation}
          result={state.result}
          viewedCase={state.viewedCase}
          selectedGate={state.selectedGate}
          hideGates={hideGates}
          showSignalLabels={colorBlind}
          onSlotClick={(slotId) => !disabled && dispatch({ type: 'clickSlot', slotId })}
          onGateDrop={(slotId, gate) => !disabled && dispatch({ type: 'placeGate', slotId, gate })}
          onToggleSource={
            (level.cases?.length ?? 0) > 1
              ? (sourceId) => dispatch({ type: 'toggleSource', sourceId })
              : undefined
          }
        />
      </section>
      <p className={styles.message} role="status" aria-live="polite">
        {messageText(state, t)}
      </p>
      <div className={styles.tray}>
        <Toolbox
          level={level}
          placement={state.placement}
          selectedGate={state.selectedGate}
          onSelect={(gate) => dispatch({ type: 'selectGate', gate })}
        />
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => dispatch({ type: 'undo' })}
            disabled={state.history.length === 0 || disabled}
          >
            ↶ {t('level.undo')}
          </Button>
          <Button className={styles.attack} onClick={test} disabled={disabled}>
            ⚡ {t('boss.attack')}
          </Button>
        </div>
      </div>
    </>
  );
}
