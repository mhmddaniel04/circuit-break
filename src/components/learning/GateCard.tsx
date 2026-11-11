import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { GateShape } from '@/features/board';
import { applyGate, GATE_ARITY, truthTable, type Bit, type GateType } from '@/features/simulation';
import { cx } from '@/lib/cx';
import styles from './GateCard.module.css';

const INPUT_NAMES = ['A', 'B'];

const Over = ({ children }: { children: ReactNode }) => (
  <span className={styles.overline}>{children}</span>
);

/** Boolean expressions, written with an overline for NOT like in SPM textbooks. */
const EXPRESSIONS: Record<GateType, ReactNode> = {
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

interface GateCardProps {
  gate: GateType;
  /** Use 3 when the card sits under another h2 heading (for example inside a lesson). */
  headingLevel?: 2 | 3;
  className?: string;
}

/** A gate's symbol, expression and truth table, with switches to try it out. */
export function GateCard({ gate, headingLevel = 2, className }: GateCardProps) {
  const { t } = useTranslation();
  const arity = GATE_ARITY[gate];
  const [inputs, setInputs] = useState<Bit[]>(Array<Bit>(arity).fill(0));
  const output = applyGate(gate, inputs);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  const toggle = (index: number) =>
    setInputs((current) => current.map((bit, i) => (i === index ? ((1 - bit) as Bit) : bit)));

  return (
    <section className={cx(styles.card, className)} aria-labelledby={`gate-${gate}`}>
      <div className={styles.cardHeader}>
        <svg className={styles.symbol} viewBox="-38 -28 76 56" aria-hidden="true">
          <GateShape gate={gate} />
        </svg>
        <div>
          <Heading id={`gate-${gate}`} className={styles.gateName}>
            {gate}
          </Heading>
          <p className={styles.expression}>{EXPRESSIONS[gate]}</p>
        </div>
      </div>
      <p className={styles.description}>{t(`learn.gates.${gate}`)}</p>

      <table className={styles.table}>
        <caption className={styles.caption}>{t('learn.truthTable')}</caption>
        <thead>
          <tr>
            {INPUT_NAMES.slice(0, arity).map((name) => (
              <th key={name} scope="col">
                {name}
              </th>
            ))}
            <th scope="col">Y</th>
          </tr>
        </thead>
        <tbody>
          {truthTable(gate).map((row) => {
            const current = row.inputs.every((bit, i) => bit === inputs[i]);
            return (
              <tr key={row.inputs.join('')} className={cx(current && styles.currentRow)}>
                {row.inputs.map((bit, i) => (
                  <td key={i}>{bit}</td>
                ))}
                <td className={styles.outputCell}>{row.output}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className={styles.tryIt}>
        <p className={styles.tryTitle}>{t('learn.tryIt')}</p>
        <div className={styles.switches}>
          {inputs.map((bit, index) => (
            <button
              key={INPUT_NAMES[index]}
              type="button"
              className={cx(styles.switch, bit === 1 && styles.switchOn)}
              aria-pressed={bit === 1}
              aria-label={t('learn.input', { name: INPUT_NAMES[index], value: bit })}
              onClick={() => toggle(index)}
            >
              {INPUT_NAMES[index]} = {bit}
            </button>
          ))}
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
          <span
            className={cx(styles.bulb, output === 1 && styles.bulbOn)}
            role="img"
            aria-label={t('learn.output', { value: output })}
          >
            {output}
          </span>
        </div>
      </div>
    </section>
  );
}
