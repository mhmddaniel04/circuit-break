import { useId, useMemo, type DragEvent, type KeyboardEvent } from 'react';
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

/** How thick the board slab looks, in SVG units. */
const SLAB = 14;
const PIN_ROWS = [-12, 0, 12];

interface BoardProps {
  level: Level;
  placement: Placement;
  /** Signals to show. null = circuit not tested yet, so no power is drawn. */
  evaluation: Evaluation | null;
  result: CheckResult | null;
  viewedCase: number;
  selectedGate: GateType | null;
  /** Colour-blind mode: write 0 or 1 on every wire after testing. */
  showSignalLabels?: boolean;
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
  showSignalLabels = false,
  onSlotClick,
  onGateDrop,
}: BoardProps) {
  const { t } = useTranslation();
  const { width, height } = boardSize(level);
  const wires = useMemo(() => layoutWires(level), [level]);
  const shownCase = result?.cases[viewedCase];
  // Unique ids for the SVG patterns, in case two boards are on one page.
  const id = useId().replace(/:/g, '');

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
      viewBox={`0 0 ${width} ${height + SLAB}`}
      role="group"
      aria-label={t('level.boardLabel')}
    >
      <defs>
        <pattern id={`${id}-dots`} width="25" height="25" patternUnits="userSpaceOnUse">
          <circle cx="12.5" cy="12.5" r="1.5" className={styles.dot} />
        </pattern>
        <radialGradient id={`${id}-lit`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="45%" stopColor="#f5b417" />
          <stop offset="100%" stopColor="#b87a00" />
        </radialGradient>
        <radialGradient id={`${id}-dark`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#8a8f98" />
          <stop offset="55%" stopColor="#454a50" />
          <stop offset="100%" stopColor="#202326" />
        </radialGradient>
      </defs>
      {/* The board is a thick circuit-board slab: its darker edge shows below the top (2.5D). */}
      <rect className={styles.edge} y={SLAB} width={width} height={height} rx={18} />
      <rect className={styles.background} width={width} height={height} rx={18} />
      <rect width={width} height={height} rx={18} fill={`url(#${id}-dots)`} />
      <rect className={styles.rim} x={4} y={4} width={width - 8} height={height - 8} rx={15} />

      {wires.map(({ index, path }) => {
        const signal = evaluation?.wires[index] ?? null;
        const state = !evaluation ? styles.wireIdle : signal === 1 ? styles.wireOn : styles.wireOff;
        // A raised copper track: a shadow, the track itself and a shiny edge on top.
        return (
          <g
            key={index}
            className={cx(
              styles.wire,
              state,
              showSignalLabels && signal === 0 && styles.wireDashed,
            )}
          >
            <path className={styles.wireShadow} d={path} />
            <path className={styles.wireTrack} d={path} />
            <path className={styles.wireShine} d={path} />
            {signal === 1 && <path className={styles.electrons} d={path} />}
          </g>
        );
      })}

      {showSignalLabels &&
        evaluation &&
        wires.map(({ index, start }) => {
          const signal = evaluation.wires[index];
          if (signal === null) return null;
          return (
            <g
              key={`label-${index}`}
              className={signal === 1 ? styles.signalLabelOn : styles.signalLabelOff}
              transform={`translate(${start.x + 14} ${start.y - 14})`}
              data-signal={signal}
              aria-hidden="true"
            >
              <circle r={9} />
              <text dy="0.35em">{signal}</text>
            </g>
          );
        })}

      {level.sources.map((source) => {
        const { x, y } = cellCenter(source.pos);
        const value = shownCase?.inputs[source.id] ?? source.value;
        const on = value === 1;
        // A chunky toggle switch: the knob slides right for 1 and left for 0.
        return (
          <g
            key={source.id}
            transform={`translate(${x} ${y})`}
            className={cx(styles.source, on ? styles.sourceOn : styles.sourceOff)}
            role="img"
            aria-label={t('level.source', { id: source.id, value })}
          >
            <rect className={styles.switchEdge} x={-24} y={-22} width={48} height={52} rx={10} />
            <rect className={styles.switchTop} x={-24} y={-28} width={48} height={52} rx={10} />
            <text className={styles.sourceValue} y={-6} dy="0.35em">
              {value}
            </text>
            <rect className={styles.switchTrack} x={-16} y={8} width={32} height={12} rx={6} />
            <rect
              className={styles.knobEdge}
              x={on ? 1 : -17}
              y={9}
              width={16}
              height={13}
              rx={5}
            />
            <rect className={styles.knob} x={on ? 1 : -17} y={6} width={16} height={12} rx={5} />
            <text className={styles.label} y={SOURCE_RADIUS + 26}>
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
              <Chip gate={gate} locked={slot.fixedGate !== undefined} />
            ) : (
              <text className={styles.plus} dy="0.35em">
                +
              </text>
            )}
            {gate && (
              <text className={styles.label} y={SLOT_HALF_HEIGHT + 20}>
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
            aria-label={
              bulbResult
                ? t(bulbResult.correct ? 'level.bulbCorrect' : 'level.bulbWrong', {
                    id: bulb.id,
                    target,
                  })
                : t('level.bulb', { id: bulb.id, target })
            }
          >
            <circle className={styles.bulbRing} r={BULB_RADIUS + 7} />
            {/* A glass dome on a metal screw base. */}
            <rect
              className={styles.bulbBase}
              x={-11}
              y={BULB_RADIUS - 8}
              width={22}
              height={14}
              rx={3}
            />
            <path className={styles.bulbThread} d={`M -11 ${BULB_RADIUS - 2} H 11`} />
            <circle
              className={styles.bulbGlass}
              r={BULB_RADIUS}
              fill={`url(#${id}-${signal === 1 ? 'lit' : 'dark'})`}
            />
            <ellipse className={styles.bulbShine} cx={-8} cy={-9} rx={7} ry={4.5} />
            <text className={styles.target} y={-BULB_RADIUS - 14}>
              {t('level.needs', { value: target })}
            </text>
            <text className={styles.label} y={BULB_RADIUS + 22}>
              {bulb.id}
            </text>
            {bulbResult && (
              // ✓ / ✗ badge: "lit" only means the output is 1, this shows whether it is correct.
              <g
                className={bulbResult.correct ? styles.badgeCorrect : styles.badgeWrong}
                transform={`translate(${BULB_RADIUS} ${-BULB_RADIUS})`}
              >
                <circle r={11} />
                <text dy="0.35em">{bulbResult.correct ? '✓' : '✗'}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** A black chip with silver pins, sitting in its socket, with the gate symbol printed on top. */
function Chip({ gate, locked }: { gate: GateType; locked: boolean }) {
  return (
    <g className={cx(styles.chip, locked && styles.chipLocked)}>
      {PIN_ROWS.map((y) => (
        <g key={y}>
          <rect className={styles.pin} x={-33} y={y - 3} width={8} height={6} rx={1.5} />
          <rect className={styles.pin} x={25} y={y - 3} width={8} height={6} rx={1.5} />
        </g>
      ))}
      <rect className={styles.chipEdge} x={-26} y={-16} width={52} height={36} rx={6} />
      <rect className={styles.chipTop} x={-26} y={-21} width={52} height={36} rx={6} />
      <circle className={styles.chipNotch} cx={-19} cy={-14} r={2.5} />
      <g transform="translate(0 -3) scale(0.62)">
        <GateShape gate={gate} variant="chip" />
      </g>
    </g>
  );
}
