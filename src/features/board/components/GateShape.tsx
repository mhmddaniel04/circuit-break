import type { GateType } from '@/features/simulation';
import { cx } from '@/lib/cx';
import styles from './GateShape.module.css';

// Gate symbols drawn around (0, 0), about 72 × 56 units, to fit inside a slot tile.
const AND_BODY = 'M -20 -16 H 2 A 16 16 0 0 1 2 16 H -20 Z';
const OR_BODY = 'M -22 -16 Q -12 0 -22 16 Q 4 16 18 0 Q 4 -16 -22 -16 Z';
const NOT_BODY = 'M -16 -15 L 12 0 L -16 15 Z';

const BODY: Record<GateType, string> = {
  AND: AND_BODY,
  NAND: AND_BODY,
  OR: OR_BODY,
  NOR: OR_BODY,
  XOR: OR_BODY,
  NOT: NOT_BODY,
};

/** Small circle on the output that means "inverted". */
const BUBBLE_X: Partial<Record<GateType, number>> = { NOT: 16, NAND: 22, NOR: 22 };

interface GateShapeProps {
  gate: GateType;
  /** 'chip': printed in light lines on top of a black chip, without the input/output legs. */
  variant?: 'symbol' | 'chip';
}

export function GateShape({ gate, variant = 'symbol' }: GateShapeProps) {
  const bubbleX = BUBBLE_X[gate];
  const outputStart = bubbleX !== undefined ? bubbleX + 4 : 18;
  const inputLines = gate === 'NOT' ? 'M -36 0 H -16' : 'M -36 -12 H -18 M -36 12 H -18';
  const chip = variant === 'chip';

  return (
    <g className={cx(styles.gate, chip && styles.chip)}>
      {!chip && <path className={styles.line} d={`${inputLines} M ${outputStart} 0 H 36`} />}
      {gate === 'XOR' && <path className={styles.line} d="M -28 -16 Q -18 0 -28 16" />}
      <path className={styles.body} d={BODY[gate]} />
      {bubbleX !== undefined && <circle className={styles.body} cx={bubbleX} cy={0} r={4} />}
    </g>
  );
}
