import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Board, CaseTable, Toolbox, useBoard, type BoardState } from '@/features/board';
import { getLevel, getNextLevel, type Level } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './LevelPage.module.css';

export default function LevelPage() {
  const { levelId = '' } = useParams();
  const { t } = useTranslation();
  const level = getLevel(levelId);

  if (!level) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>{t('level.notFound')}</p>
        <Link to="/" className={styles.homeLink}>
          {t('level.home')}
        </Link>
      </main>
    );
  }

  // `key` makes React start fresh when moving to the next level.
  return <LevelView key={level.id} level={level} />;
}

function LevelView({ level }: { level: Level }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch, evaluation } = useBoard(level);
  const [showHint, setShowHint] = useState(false);

  const lang = i18n.language === 'ms' ? 'ms' : 'en';
  const nextLevel = getNextLevel(level.id);
  const solved = state.result?.solved ?? false;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('level.back')}
        </Button>
        <div className={styles.titleBlock}>
          <p className={styles.levelNumber}>
            {t('level.number', { world: level.world, order: level.order })}
          </p>
          <h1 className={styles.title}>{level.title[lang]}</h1>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowHint((open) => !open)}
          aria-expanded={showHint}
        >
          💡 {t('level.hint')}
        </Button>
      </header>

      <p className={styles.concept}>{level.concept[lang]}</p>

      {showHint && (
        <aside className={styles.hint}>
          <strong>{t('level.hintFrom')}</strong> {level.hint[lang]}
        </aside>
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
        <Button onClick={() => dispatch({ type: 'test' })}>⚡ {t('level.test')}</Button>
      </div>

      {state.result && (
        <CaseTable
          level={level}
          result={state.result}
          viewedCase={state.viewedCase}
          onView={(index) => dispatch({ type: 'viewCase', index })}
        />
      )}

      {solved && (
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
            <p>{t('level.solvedText')}</p>
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={() => dispatch({ type: 'reset' })}>
                {t('level.replay')}
              </Button>
              {nextLevel ? (
                <Button onClick={() => navigate(`/level/${nextLevel.id}`)}>
                  {t('level.next')} →
                </Button>
              ) : (
                <Button onClick={() => navigate('/')}>{t('level.home')}</Button>
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
