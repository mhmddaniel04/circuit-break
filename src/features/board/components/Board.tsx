import { useMemo, type DragEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getEffectiveGate,
  slotAccepts,
  type CheckResult,
  type Evaluation,
  type GateType,
  type Placement,
} from '@/features/simulation';
import type { Level } from '@/levels';
import { cx } from '@/lib/cx';
import { GATE_DRAG_TYPE, isGateType } from '../gateDrag';
import {
  boardSize,
  BULB_RADIUS,
  cellCenter,
  layoutWires,
  SLOT_HALF_HEIGHT,
  SLOT_HALF_WIDTH,
  SOURCE_RADIUS,
} from '../layout';
import styles from './Board.module.css';
import { GateShape } from './GateShape';

interface BoardProps {
  level: Level;
  placement: Placement;
  /** Signals to show. null = circuit not tested yet, so no power is drawn. */
  evaluation: Evaluation | null;
  result: CheckResult | null;
  viewedCase: number;
  selectedGate: GateType | null;
  onSlotClick: (slotId: string) => void;
  onGateDrop: (slotId: string, gate: GateType) => void;
}

export function Board({
  level,
  placement,
  evaluation,
  result,
  viewedCase,
  selectedGate,
  onSlotClick,
  onGateDrop,
}: BoardProps) {
  const { t } = useTranslation();
  const { width, height } = boardSize(level);
  const wires = useMemo(() => layoutWires(level), [level]);
  const shownCase = result?.cases[viewedCase];

  const handleKey = (slotId: string) => (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSlotClick(slotId);
    }
  };

  const handleDrop = (slotId: string) => (event: DragEvent) => {
    event.preventDefault();
    const gate = event.dataTransfer.getData(GATE_DRAG_TYPE);
    if (isGateType(gate)) onGateDrop(slotId, gate);
  };

  return (
    <svg
      className={styles.board}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label={t('level.boardLabel')}
    >
      <defs>
        <pattern id="board-dots" width="25" height="25" patternUnits="userSpaceOnUse">
          <circle cx="12.5" cy="12.5" r="1.5" className={styles.dot} />
        </pattern>
      </defs>
      <rect className={styles.background} width={width} height={height} rx={16} />
      <rect width={width} height={height} fill="url(#board-dots)" />

      {wires.map(({ index, path }) => {
        const signal = evaluation?.wires[index] ?? null;
        const state = !evaluation ? styles.wireIdle : signal === 1 ? styles.wireOn : styles.wireOff;
        return (
          <g key={index}>
            <path className={cx(styles.wire, state)} d={path} />
            {signal === 1 && <path className={styles.electrons} d={path} />}
          </g>
        );
      })}

      {level.sources.map((source) => {
        const { x, y } = cellCenter(source.pos);
        const value = shownCase?.inputs[source.id] ?? source.value;
        return (
          <g
            key={source.id}
            transform={`translate(${x} ${y})`}
            role="img"
            aria-label={t('level.source', { id: source.id, value })}
          >
            <circle
              r={SOURCE_RADIUS}
              className={cx(styles.source, value === 1 ? styles.sourceOn : styles.sourceOff)}
            />
            <text className={styles.sourceValue} dy="0.35em">
              {value}
            </text>
            <text className={styles.label} y={SOURCE_RADIUS + 20}>
              {source.id}
            </text>
          </g>
        );
      })}

      {level.slots.map((slot) => {
        const { x, y } = cellCenter(slot.pos);
        const gate = getEffectiveGate(slot, placement);
        const droppable = selectedGate !== null && slotAccepts(level, slot.id, selectedGate);
        const label = slot.fixedGate
          ? t('level.slotLocked', { id: slot.id, gate })
          : gate
            ? t('level.slotFilled', { id: slot.id, gate })
            : t('level.slotEmpty', { id: slot.id });

        return (
          <g
            key={slot.id}
            transform={`translate(${x} ${y})`}
            className={cx(
              styles.slot,
              gate && styles.slotFilled,
              droppable && styles.slotDroppable,
              slot.fixedGate && styles.slotLocked,
            )}
            role="button"
            tabIndex={0}
            aria-label={label}
            onClick={() => onSlotClick(slot.id)}
            onKeyDown={handleKey(slot.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop(slot.id)}
          >
            <rect
              className={styles.slotTile}
              x={-SLOT_HALF_WIDTH}
              y={-SLOT_HALF_HEIGHT}
              width={SLOT_HALF_WIDTH * 2}
              height={SLOT_HALF_HEIGHT * 2}
              rx={10}
            />
            {gate ? (
              <GateShape gate={gate} />
            ) : (
              <text className={styles.plus} dy="0.35em">
                +
              </text>
            )}
            {gate && (
              <text className={styles.label} y={SLOT_HALF_HEIGHT + 18}>
                {slot.fixedGate ? `🔒 ${gate}` : gate}
              </text>
            )}
          </g>
        );
      })}

      {level.bulbs.map((bulb) => {
        const { x, y } = cellCenter(bulb.pos);
        const signal = evaluation?.nodes[bulb.id] ?? null;
        const bulbResult = shownCase?.bulbs.find((b) => b.id === bulb.id);
        const target = bulbResult?.expected ?? bulb.target;
        return (
          <g
            key={bulb.id}
            transform={`translate(${x} ${y})`}
            className={cx(
              styles.bulb,
              signal === 1 && styles.bulbLit,
              bulbResult?.correct === true && styles.bulbCorrect,
              bulbResult?.correct === false && styles.bulbWrong,
            )}
            role="img"
            aria-label={t('level.bulb', { id: bulb.id, target })}
          >
            <circle className={styles.bulbRing} r={BULB_RADIUS + 7} />
            <circle className={styles.bulbGlass} r={BULB_RADIUS} />
            <rect
              className={styles.bulbBase}
              x={-10}
              y={BULB_RADIUS - 6}
              width={20}
              height={12}
              rx={3}
            />
            <text className={styles.target} y={-BULB_RADIUS - 14}>
              {t('level.needs', { value: target })}
            </text>
            <text className={styles.label} y={BULB_RADIUS + 22}>
              {bulb.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
