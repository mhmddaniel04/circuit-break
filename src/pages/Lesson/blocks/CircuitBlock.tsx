import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircuitDemo } from '@/components/learning/CircuitDemo';
import { GATE_ARITY, type Bit, type GateType } from '@/features/simulation';
import styles from './blocks.module.css';

/** A live circuit: flip the switches and watch the signal flow to the bulb. */
export function CircuitBlock({ gate }: { gate: GateType }) {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<Bit[]>(Array<Bit>(GATE_ARITY[gate]).fill(0));

  const toggle = (index: number) =>
    setInputs((current) => current.map((bit, i) => (i === index ? ((1 - bit) as Bit) : bit)));

  return (
    <div className={styles.circuit}>
      <p className={styles.blockLabel}>⚡ {t('lesson.tryCircuit')}</p>
      <CircuitDemo gate={gate} inputs={inputs} onToggle={toggle} />
    </div>
  );
}
