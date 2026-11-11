import type { ReactNode } from 'react';
import type { GateType } from '@/features/simulation';
import styles from './gateExpressions.module.css';

const Over = ({ children }: { children: ReactNode }) => (
  <span className={styles.overline}>{children}</span>
);

/** Boolean expressions, written with an overline for NOT like in SPM textbooks. */
export const GATE_EXPRESSIONS: Record<GateType, ReactNode> = {
  NOT: (
    <>
      Y = <Over>A</Over>
    </>
  ),
  AND: <>Y = A · B</>,
  OR: <>Y = A + B</>,
  NAND: (
    <>
      Y = <Over>A · B</Over>
    </>
  ),
  NOR: (
    <>
      Y = <Over>A + B</Over>
    </>
  ),
  XOR: <>Y = A ⊕ B</>,
};
