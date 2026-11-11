import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { GateShape } from '@/features/board';
import { applyGate, type Bit, type GateType } from '@/features/simulation';
import { cx } from '@/lib/cx';
import styles from './CircuitDemo.module.css';

const INPUT_NAMES = ['A', 'B'];

// Layout in SVG units. The gate symbol is drawn around (0, 0) with its pins at x = ±36.
const GATE_X = 180;
const GATE_Y = 75;
const GATE_SCALE = 1.4;
const PIN_IN_X = GATE_X - 36 * GATE_SCALE;
const PIN_OUT_X = GATE_X + 36 * GATE_SCALE;
const BULB_X = 318;

interface CircuitDemoProps {
  gate: GateType;
  inputs: Bit[];
  /** Makes the switches clickable. Without it, the circuit is just shown. */
  onToggle?: (index: number) => void;
  /** Shows "?" in the bulb, for "predict first" questions. */
  hideOutput?: boolean;
}

/** Switches → gate → bulb. Wires that carry a 1 glow, with electricity flowing along them. */
export function CircuitDemo({ gate, inputs, onToggle, hideOutput = false }: CircuitDemoProps) {
  const { t } = useTranslation();
  const output = applyGate(gate, inputs);
  const switchY = inputs.length === 1 ? [GATE_Y] : [40, 110];
  const pinY =
    inputs.length === 1 ? [GATE_Y] : [GATE_Y - 12 * GATE_SCALE, GATE_Y + 12 * GATE_SCALE];

  const onSwitchKey = (event: KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle?.(index);
    }
  };

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.svg}
        viewBox="0 0 360 150"
        role="group"
        aria-label={t('lesson.circuitLabel', { gate })}
      >
        {inputs.map((bit, index) => (
          <Wire
            key={index}
            on={bit === 1}
            d={`M 74 ${switchY[index]} H 104 V ${pinY[index]} H ${PIN_IN_X}`}
          />
        ))}
        <Wire on={!hideOutput && output === 1} d={`M ${PIN_OUT_X} ${GATE_Y} H ${BULB_X - 18}`} />

        <g transform={`translate(${GATE_X} ${GATE_Y}) scale(${GATE_SCALE})`}>
          <GateShape gate={gate} />
        </g>
        <text className={styles.gateName} x={GATE_X} y={GATE_Y + 48} textAnchor="middle">
          {gate}
        </text>

        {inputs.map((bit, index) => (
          <g
            key={INPUT_NAMES[index]}
            className={cx(
              styles.switch,
              bit === 1 && styles.switchOn,
              onToggle && styles.clickable,
            )}
            {...(onToggle && {
              role: 'switch',
              tabIndex: 0,
              'aria-checked': bit === 1,
              'aria-label': t('learn.input', { name: INPUT_NAMES[index], value: bit }),
              onClick: () => onToggle(index),
              onKeyDown: (event: KeyboardEvent) => onSwitchKey(event, index),
            })}
          >
            <rect x={8} y={switchY[index] - 18} width={66} height={36} rx={10} />
            <text x={41} y={switchY[index] + 6} textAnchor="middle">
              {INPUT_NAMES[index]} = {bit}
            </text>
          </g>
        ))}

        <g className={cx(styles.bulb, !hideOutput && output === 1 && styles.bulbOn)}>
          <circle cx={BULB_X} cy={GATE_Y} r={20} />
          <text x={BULB_X} y={GATE_Y + 7} textAnchor="middle">
            {hideOutput ? '?' : output}
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption} aria-live="polite">
        {hideOutput ? t('lesson.outputHidden') : t('learn.output', { value: output })}
      </figcaption>
    </figure>
  );
}

function Wire({ d, on }: { d: string; on: boolean }) {
  return (
    <g className={cx(styles.wire, on && styles.wireOn)}>
      <path className={styles.wireBase} d={d} />
      {on && <path className={styles.wireFlow} d={d} />}
    </g>
  );
}
