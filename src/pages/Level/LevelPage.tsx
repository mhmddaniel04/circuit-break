import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Stars';
import { Board, CaseTable, Toolbox, useBoard, type BoardState } from '@/features/board';
import { HintPanel, useHints } from '@/features/hints';
import { isLevelUnlocked, useProgressStore, type LevelResult } from '@/features/progress';
import { computeScore, computeStars } from '@/features/scoring';
import { checkSolution } from '@/features/simulation';
import { getLevel, getNextLevel, LEVELS, type Level } from '@/levels';
import { cx } from '@/lib/cx';
import { formatTime } from '@/lib/formatTime';
import { useElapsedSeconds } from '@/lib/useElapsedSeconds';
import styles from './LevelPage.module.css';
import { TutorialPanel } from './TutorialPanel';

export default function LevelPage() {
  const { levelId = '' } = useParams();
  const { t } = useTranslation();
  const records = useProgressStore((state) => state.levels);
  // Changing this number restarts the level (used by "Play again").
  const [run, setRun] = useState(0);
  const level = getLevel(levelId);

  if (!level) return <Notice text={t('level.notFound')} />;
  if (!isLevelUnlocked(level.id, records, LEVELS)) return <Notice text={t('level.locked')} />;

  return (
    <LevelView
      key={`${level.id}-${run}`}
      level={level}
      onReplay={() => setRun((count) => count + 1)}
    />
  );
}

function Notice({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <main className={styles.page}>
      <p className={styles.message}>{text}</p>
      <Link to="/worlds" className={styles.mapLink}>
        {t('level.worldMap')}
      </Link>
    </main>
  );
}

interface Outcome extends LevelResult {
  isNewBest: boolean;
}

type HintPanelState = 'closed' | 'confirm' | 'open';

function LevelView({ level, onReplay }: { level: Level; onReplay: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const recordResult = useProgressStore((state) => state.recordResult);
  const { state, dispatch, evaluation } = useBoard(level);
  const lang = i18n.language === 'ms' ? 'ms' : 'en';
  const hint = useHints(level, lang);

  const [hintPanel, setHintPanel] = useState<HintPanelState>('closed');
  const [hintUsed, setHintUsed] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const elapsed = useElapsedSeconds(startedAt, outcome === null);

  const nextLevel = getNextLevel(level.id);

  const toggleHint = () =>
    setHintPanel((panel) => (panel !== 'closed' ? 'closed' : hintUsed ? 'open' : 'confirm'));

  const revealHint = () => {
    setHintUsed(true);
    setHintPanel('open');
    void hint.askHint(state.placement);
  };

  const handleTest = () => {
    dispatch({ type: 'test' });
    if (!checkSolution(level, state.placement).solved) return;

    const stats = {
      attempts: state.attempts + 1,
      hintUsed,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      parSeconds: level.par.seconds,
    };
    const result: LevelResult = {
      stars: computeStars(stats),
      score: computeScore(stats),
      seconds: stats.seconds,
    };
    const isNewBest = recordResult(level.id, result);
    setOutcome({ ...result, isNewBest });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/worlds')}>
          ← {t('level.back')}
        </Button>
        <div className={styles.titleBlock}>
          <p className={styles.levelNumber}>
            {t('level.number', { world: level.world, order: level.order })}
          </p>
          <h1 className={styles.title}>{level.title[lang]}</h1>
          <p className={styles.timer}>⏱ {formatTime(outcome?.seconds ?? elapsed)}</p>
        </div>
        <Button variant="secondary" onClick={toggleHint} aria-expanded={hintPanel !== 'closed'}>
          💡 {t('level.hint')}
        </Button>
      </header>

      <p className={styles.concept}>{level.concept[lang]}</p>

      {level.tutorial && <TutorialPanel steps={level.tutorial} />}

      {hintPanel === 'confirm' && (
        <aside className={styles.hint}>
          <p>{t('level.hintWarning')}</p>
          <Button onClick={revealHint}>{t('level.showHint')}</Button>
        </aside>
      )}
      {hintPanel === 'open' && (
        <HintPanel
          hints={hint.hints}
          loading={hint.loading}
          failed={hint.failed}
          canAskMore={hint.canAskMore}
          onAskMore={() => void hint.askHint(state.placement)}
        />
      )}

      <section className={styles.boardCard}>
        <Board
          level={level}
          placement={state.placement}
          evaluation={evaluation}
          result={state.result}
          viewedCase={state.viewedCase}
          selectedGate={state.selectedGate}
          onSlotClick={(slotId) => dispatch({ type: 'clickSlot', slotId })}
          onGateDrop={(slotId, gate) => dispatch({ type: 'placeGate', slotId, gate })}
        />
      </section>

      <p className={cx(styles.message, messageTone(state))} role="status" aria-live="polite">
        {messageText(state, t)}
      </p>

      <Toolbox
        level={level}
        placement={state.placement}
        selectedGate={state.selectedGate}
        onSelect={(gate) => dispatch({ type: 'selectGate', gate })}
      />

      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: 'undo' })}
          disabled={state.history.length === 0}
        >
          ↶ {t('level.undo')}
        </Button>
        <Button variant="ghost" onClick={() => dispatch({ type: 'reset' })}>
          ⟲ {t('level.reset')}
        </Button>
        <Button onClick={handleTest}>⚡ {t('level.test')}</Button>
      </div>

      {state.result && (
        <CaseTable
          level={level}
          result={state.result}
          viewedCase={state.viewedCase}
          onView={(index) => dispatch({ type: 'viewCase', index })}
        />
      )}

      {outcome && (
        <div className={styles.overlay}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="solved-title"
          >
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

            {outcome.stars < 3 && (
              <p className={styles.tip}>{t(hintUsed ? 'level.tipNoHint' : 'level.tipFirstTry')}</p>
            )}

            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={onReplay}>
                {t('level.replay')}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/worlds')}>
                {t('level.worldMap')}
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

type Translate = ReturnType<typeof useTranslation>['t'];

function messageText(state: BoardState, t: Translate): string {
  if (state.message) {
    const { key, ...values } = state.message;
    return t(`level.messages.${key}`, values);
  }
  if (state.selectedGate) return t('level.messages.tapSlot', { gate: state.selectedGate });
  return t('level.messages.pickGate');
}

function messageTone(state: BoardState): string | undefined {
  if (!state.message) return undefined;
  return state.message.key === 'solved' ? styles.success : styles.warning;
}
