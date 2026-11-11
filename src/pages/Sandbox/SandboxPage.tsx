import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { BitAvatar } from '@/components/ui/BitAvatar';
import { Button } from '@/components/ui/Button';
import { Board, Toolbox, useBoard } from '@/features/board';
import { Expression } from '@/features/practice';
import { sandboxExpression, SANDBOX_SHAPES } from '@/features/sandbox';
import { useSettingsStore } from '@/features/settings';
import { evaluateCircuit, getTestCases } from '@/features/simulation';
import type { Level } from '@/levels';
import { cx } from '@/lib/cx';
import styles from './SandboxPage.module.css';

/** Free building: any gate in any slot, with the truth table and expression worked out live. */
export default function SandboxPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [shapeId, setShapeId] = useState(SANDBOX_SHAPES[0].id);
  const shape = SANDBOX_SHAPES.find((level) => level.id === shapeId)!;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('map.home')}
        </Button>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t('sandbox.title')}</h1>
          <p className={styles.subtitle}>{t('sandbox.subtitle')}</p>
        </div>
      </header>

      <div className={styles.shapes} role="group" aria-label={t('sandbox.shapes')}>
        {SANDBOX_SHAPES.map((level) => (
          <button
            key={level.id}
            type="button"
            className={cx(styles.shape, level.id === shapeId && styles.shapeActive)}
            aria-pressed={level.id === shapeId}
            onClick={() => setShapeId(level.id)}
          >
            {t(`sandbox.shapeNames.${level.id.replace('sandbox-', '')}`)}
          </button>
        ))}
      </div>

      <SandboxBoard key={shape.id} level={shape} />
    </main>
  );
}

function SandboxBoard({ level }: { level: Level }) {
  const { t } = useTranslation();
  const { state, dispatch, evaluation } = useBoard(level);
  const colorBlind = useSettingsStore((settings) => settings.colorBlind);
  const rows = getTestCases(level);
  const outputs = rows.map(
    (row) => evaluateCircuit(level, state.placement, row.inputs).nodes.Y ?? null,
  );
  const expression = sandboxExpression(level, state.placement);

  return (
    <>
      <div className={styles.layout}>
        <section className={styles.side} aria-labelledby="sandbox-table">
          <div className={styles.card}>
            <h2 className={styles.cardLabel}>{t('sandbox.expression')}</h2>
            {expression ? (
              <p className={styles.expression}>
                <Expression name="Y" tokens={expression} />
              </p>
            ) : (
              <p className={styles.waiting}>{t('sandbox.fillSlots')}</p>
            )}
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption id="sandbox-table" className={styles.caption}>
                {t('sandbox.liveTable')}
              </caption>
              <thead>
                <tr>
                  {level.sources.map((source) => (
                    <th key={source.id} scope="col">
                      {source.id}
                    </th>
                  ))}
                  <th scope="col">Y</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className={cx(index === state.viewedCase && styles.viewed)}
                    onClick={() => dispatch({ type: 'viewCase', index })}
                  >
                    {level.sources.map((source) => (
                      <td key={source.id}>{row.inputs[source.id]}</td>
                    ))}
                    <td className={styles.output}>{outputs[index] ?? '·'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.center}>
          <section className={styles.boardCard}>
            <Board
              level={level}
              placement={state.placement}
              evaluation={evaluation}
              result={null}
              viewedCase={state.viewedCase}
              selectedGate={state.selectedGate}
              showGoals={false}
              showSignalLabels={colorBlind}
              onSlotClick={(slotId) => dispatch({ type: 'clickSlot', slotId })}
              onGateDrop={(slotId, gate) => dispatch({ type: 'placeGate', slotId, gate })}
              onToggleSource={(sourceId) => dispatch({ type: 'toggleSource', sourceId })}
            />
          </section>
          <div className={styles.bit}>
            <BitAvatar className={styles.bitFace} mood="explaining" />
            <p className={styles.tip}>{t('sandbox.tip')}</p>
          </div>
        </div>
      </div>

      <div className={styles.tray}>
        <Toolbox
          level={level}
          placement={state.placement}
          selectedGate={state.selectedGate}
          onSelect={(gate) => dispatch({ type: 'selectGate', gate })}
          unlimited
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
            ⟲ {t('sandbox.clear')}
          </Button>
        </div>
      </div>
    </>
  );
}
