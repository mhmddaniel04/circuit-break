import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BitAvatar, type BitMood } from '@/components/ui/BitAvatar';
import { BitCharacter } from '@/components/ui/BitCharacter';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { Stars } from '@/components/ui/Stars';
import {
  Board,
  CaseTable,
  hasTruthTable,
  Toolbox,
  useBoard,
  type BoardState,
} from '@/features/board';
import { HintPanel, useHints } from '@/features/hints';
import { useProgressStore, type LevelResult } from '@/features/progress';
import { todayKey } from '@/features/daily';
import {
  CoinChip,
  HINT_COSTS,
  RewardSummary,
  rewardDailySolved,
  rewardLevelSolved,
  usePlayerStore,
  type RewardResult,
} from '@/features/rewards';
import { computeScore, computeStars } from '@/features/scoring';
import { useSettingsStore } from '@/features/settings';
import { checkSolution, getTestCases } from '@/features/simulation';
import { bossTimeLimit, getLevelsByWorld, getNextLevel, isBossLevel, type Level } from '@/levels';
import { cx } from '@/lib/cx';
import { formatTime } from '@/lib/formatTime';
import { useElapsedSeconds } from '@/lib/useElapsedSeconds';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import styles from './LevelPage.module.css';
import { TutorialPanel } from './TutorialPanel';
import { useLevelSounds } from './useLevelSounds';

interface Outcome extends LevelResult {
  isNewBest: boolean;
  reward: RewardResult;
  /** Daily challenge only: the streak after this solve, and whether it was today's first. */
  daily?: { streak: number; firstToday: boolean };
}

type HintPanelState = 'closed' | 'confirm' | 'open';

interface LevelViewProps {
  level: Level;
  onReplay: () => void;
  /** 'story': a district level (saved, unlocks the next one). 'daily': today's daily challenge. */
  mode?: 'story' | 'daily';
}

/** Playing one level: the board, toolbox, hints and the "Circuit complete!" window. */
export function LevelView({ level, onReplay, mode = 'story' }: LevelViewProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const recordResult = useProgressStore((state) => state.recordResult);
  const records = useProgressStore((state) => state.levels);
  const { state, dispatch, evaluation } = useBoard(level);
  const lang = i18n.language === 'ms' ? 'ms' : 'en';
  const hint = useHints(level, lang);
  const colorBlind = useSettingsStore((settings) => settings.colorBlind);
  useLevelSounds(state);

  const [hintPanel, setHintPanel] = useState<HintPanelState>('closed');
  const coins = usePlayerStore((player) => player.coins);
  const spendCoins = usePlayerStore((player) => player.spendCoins);
  const refundCoins = usePlayerStore((player) => player.refundCoins);
  const hintsBought = hint.hints.length;
  const nextHintCost = HINT_COSTS[Math.min(hintsBought, HINT_COSTS.length - 1)];
  const [startedAt] = useState(() => Date.now());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const elapsed = useElapsedSeconds(startedAt, outcome === null);

  const story = mode === 'story';
  const nextLevel = story ? getNextLevel(level.id) : undefined;
  // Boss levels: beat the clock for a bonus. When time runs out the level can still be finished.
  const boss = story && isBossLevel(level);
  const timeLimit = bossTimeLimit(level);
  const shownSeconds = outcome?.seconds ?? elapsed;
  const timeLeft = timeLimit - shownSeconds;

  const toggleHint = () =>
    setHintPanel((panel) => (panel !== 'closed' ? 'closed' : hintsBought > 0 ? 'open' : 'confirm'));

  /** Hints cost coins. If no hint could be given, the coins come back. */
  const buyHint = async () => {
    const cost = nextHintCost;
    if (!spendCoins(cost)) return;
    setHintPanel('open');
    const delivered = await hint.askHint(state.placement);
    if (!delivered) refundCoins(cost);
  };

  const handleTest = () => {
    dispatch({ type: 'test' });
    if (!checkSolution(level, state.placement).solved) return;

    const stats = {
      attempts: state.attempts + 1,
      hintUsed: hintsBought > 0,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      parSeconds: level.par.seconds,
    };
    const result: LevelResult = {
      stars: computeStars(stats),
      score: computeScore(stats),
      seconds: stats.seconds,
    };
    if (!story) {
      const { streak, firstToday, ...reward } = rewardDailySolved(todayKey());
      setOutcome({ ...result, isNewBest: false, reward, daily: { streak, firstToday } });
      return;
    }

    const previous = records[level.id];
    const isNewBest = recordResult(level.id, result);
    const reward = rewardLevelSolved({
      levelId: level.id,
      previous,
      stars: result.stars,
      attempts: stats.attempts,
      seconds: stats.seconds,
      parSeconds: stats.parSeconds,
      hintsBought,
      bossInTime: boss && stats.seconds <= timeLimit,
    });
    setOutcome({ ...result, isNewBest, reward });
  };

  // Keyboard play: 1-6 pick a gate, T tests, Z undoes, H opens the hint.
  useKeyboardShortcuts(
    {
      ...Object.fromEntries(
        level.toolbox.map(({ gate }, index) => [
          String(index + 1),
          () => dispatch({ type: 'selectGate', gate }),
        ]),
      ),
      t: handleTest,
      z: () => dispatch({ type: 'undo' }),
      h: toggleHint,
    },
    outcome === null,
  );

  const truthTable = hasTruthTable(level);
  const districtLevels = getLevelsByWorld(level.world);
  const districtDone = districtLevels.filter((l) => records[l.id] !== undefined).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate(story ? '/worlds' : '/')}>
          ← {story ? t('level.back') : t('map.home')}
        </Button>
        <div className={styles.titleBlock}>
          <p className={styles.levelNumber}>
            {boss && <span className={styles.bossTag}>👾 {t('boss.tag')}</span>}
            {story
              ? t('level.number', { world: level.world, order: level.order })
              : t('daily.kicker')}
          </p>
          <h1 className={styles.title}>{level.title[lang]}</h1>
        </div>
        <div className={styles.headerChips}>
          {boss ? (
            <p
              className={cx(styles.timer, styles.bossTimer, timeLeft <= 10 && styles.bossTimerLow)}
              role="timer"
              aria-label={
                timeLeft >= 0
                  ? t('boss.timeLeft', { time: formatTime(timeLeft) })
                  : t('boss.overtime', { time: formatTime(-timeLeft) })
              }
            >
              ⏳ {timeLeft >= 0 ? formatTime(timeLeft) : `+${formatTime(-timeLeft)}`}
            </p>
          ) : (
            <p className={styles.timer}>⏱ {formatTime(shownSeconds)}</p>
          )}
          <CoinChip coins={coins} />
        </div>
        <Button variant="secondary" onClick={toggleHint} aria-expanded={hintPanel !== 'closed'}>
          💡 {t('level.hint')}
        </Button>
      </header>

      <div className={styles.layout}>
        <section className={styles.goal} aria-labelledby="goal-title">
          <h2 id="goal-title" className={styles.goalLabel}>
            {t('level.goal')}
          </h2>
          <p className={styles.concept}>{level.concept[lang]}</p>
        </section>

        <div className={styles.center}>
          {level.tutorial && <TutorialPanel steps={level.tutorial} />}

          {boss && !outcome && (
            <p className={cx(styles.bossBanner, timeLeft < 0 && styles.bossBannerLate)}>
              {timeLeft >= 0 ? t('boss.banner', { time: formatTime(timeLimit) }) : t('boss.timeUp')}
            </p>
          )}

          {hintPanel === 'confirm' && (
            <aside className={styles.hint}>
              <p>{t('level.hintCost', { cost: nextHintCost, coins })}</p>
              <Button onClick={() => void buyHint()} disabled={coins < nextHintCost}>
                💡 {t('level.buyHint', { cost: nextHintCost })}
              </Button>
              {coins < nextHintCost && <p>{t('level.notEnoughCoins')}</p>}
            </aside>
          )}
          {hintPanel === 'open' && (
            <HintPanel
              hints={hint.hints}
              loading={hint.loading}
              canAskMore={hint.canAskMore}
              nextCost={nextHintCost}
              canAfford={coins >= nextHintCost}
              onAskMore={() => void buyHint()}
            />
          )}

          {truthTable && <RowStrip level={level} index={state.viewedCase} result={state.result} />}

          <section className={cx(styles.boardCard, boss && styles.bossBoard)}>
            <Board
              level={level}
              placement={state.placement}
              evaluation={evaluation}
              result={state.result}
              viewedCase={state.viewedCase}
              selectedGate={state.selectedGate}
              highlightSlot={hintPanel === 'open' ? hint.focusSlot : undefined}
              showSignalLabels={colorBlind}
              onSlotClick={(slotId) => dispatch({ type: 'clickSlot', slotId })}
              onGateDrop={(slotId, gate) => dispatch({ type: 'placeGate', slotId, gate })}
              onToggleSource={
                truthTable ? (sourceId) => dispatch({ type: 'toggleSource', sourceId }) : undefined
              }
            />
          </section>

          <div className={styles.bit}>
            <BitAvatar className={styles.bitFace} mood={bitMood(state)} />
            <p className={cx(styles.message, messageTone(state))} role="status" aria-live="polite">
              {messageText(state, t)}
            </p>
          </div>
        </div>

        <div className={styles.results}>
          {truthTable ? (
            <CaseTable
              level={level}
              result={state.result}
              viewedCase={state.viewedCase}
              onView={(index) => dispatch({ type: 'viewCase', index })}
            />
          ) : (
            <p className={styles.resultsEmpty}>{t('level.resultsEmpty')}</p>
          )}
        </div>
      </div>

      {/* The toolbox and buttons stay at the bottom of the screen, within thumb reach. */}
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
            disabled={state.history.length === 0}
          >
            ↶ {t('level.undo')}
          </Button>
          <Button variant="secondary" onClick={() => dispatch({ type: 'reset' })}>
            ⟲ {t('level.reset')}
          </Button>
          <Button className={styles.testButton} onClick={handleTest}>
            ⚡ {t('level.test')}
          </Button>
        </div>
      </div>

      {outcome && (
        <div className={styles.overlay}>
          {outcome.stars === 3 && <Confetti />}
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="solved-title"
          >
            <BitCharacter className={styles.dialogBit} pose="cheer" label={t('level.bitCheer')} />
            <h2 id="solved-title" className={styles.dialogTitle}>
              {t('level.solved')}
            </h2>
            <Stars
              count={outcome.stars}
              size="large"
              animated
              label={t('level.starsLabel', { count: outcome.stars })}
            />
            {outcome.isNewBest && <p className={styles.newBest}>{t('level.newBest')}</p>}

            <dl className={styles.stats}>
              <div>
                <dt>{t('level.score')}</dt>
                <dd>{outcome.score}</dd>
              </div>
              <div>
                <dt>{t('level.time')}</dt>
                <dd>{formatTime(outcome.seconds)}</dd>
              </div>
            </dl>

            {outcome.daily && (
              <p className={styles.streak}>
                🔥 {t('daily.streak', { count: outcome.daily.streak })}
                {!outcome.daily.firstToday && (
                  <span className={styles.streakNote}> · {t('daily.alreadyDone')}</span>
                )}
              </p>
            )}

            {story && (
              <div className={styles.power}>
                <p className={styles.powerText}>
                  <span>{t('level.districtPower', { name: t(`worlds.${level.world}.name`) })}</span>
                  <span>
                    {districtDone === districtLevels.length
                      ? t('level.districtPowered')
                      : t('level.districtProgress', {
                          done: districtDone,
                          total: districtLevels.length,
                        })}
                  </span>
                </p>
                <div className={styles.powerBar} aria-hidden="true">
                  {districtLevels.map((l) => (
                    <span
                      key={l.id}
                      className={cx(
                        styles.powerCell,
                        records[l.id] !== undefined && styles.powerCellOn,
                        l.id === level.id && styles.powerCellNew,
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <RewardSummary result={outcome.reward} />

            {outcome.stars < 3 && <p className={styles.tip}>{t('level.tipFirstTry')}</p>}

            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={onReplay}>
                {t('level.replay')}
              </Button>
              <Button variant="secondary" onClick={() => navigate(story ? '/worlds' : '/')}>
                {story ? t('level.worldMap') : t('map.home')}
              </Button>
              {nextLevel && (
                <Button onClick={() => navigate(`/level/${nextLevel.id}`)}>
                  {t('level.next')} →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/** "Row 2 of 8: A = 0, B = 0, C = 1 → Y must stay OFF", above the board. */
function RowStrip({
  level,
  index,
  result,
}: {
  level: Level;
  index: number;
  result: BoardState['result'];
}) {
  const { t } = useTranslation();
  const cases = getTestCases(level);
  const testCase = cases[index];
  const tested = result?.cases[index];
  const inputs = level.sources.map((source) => `${source.id} = ${testCase.inputs[source.id]}`);
  const goals = level.bulbs.map(
    (bulb) => `${bulb.id} ${t(testCase.targets[bulb.id] === 1 ? 'level.mustOn' : 'level.mustOff')}`,
  );

  return (
    <div className={styles.rowStrip} aria-live="polite">
      <p className={styles.rowText}>
        <span className={styles.rowNumber}>
          {t('level.rowLabel', { number: index + 1, total: cases.length })}
        </span>{' '}
        {inputs.join(', ')} → <strong>{goals.join(', ')}</strong>
        {tested && (
          <span className={tested.passed ? styles.rowPass : styles.rowFail}>
            {' '}
            {tested.passed ? '✓' : '✗'}
          </span>
        )}
      </p>
      <p className={styles.rowHelp}>{t('level.tapSwitches')}</p>
    </div>
  );
}

type Translate = ReturnType<typeof useTranslation>['t'];

function messageText(state: BoardState, t: Translate): string {
  if (state.message) {
    const { key, ...values } = state.message;
    return t(`level.messages.${key}`, values);
  }
  if (state.selectedGate) return t('level.messages.tapSlot', { gate: state.selectedGate });
  return t('level.messages.pickGate');
}

/** Bit's face matches what just happened on the board. */
function bitMood(state: BoardState): BitMood {
  if (!state.message) return 'happy';
  if (state.message.key === 'solved') return 'celebrating';
  return state.message.key === 'notSolved' ? 'oops' : 'explaining';
}

function messageTone(state: BoardState): string | undefined {
  if (!state.message) return undefined;
  return state.message.key === 'solved' ? styles.success : styles.warning;
}
