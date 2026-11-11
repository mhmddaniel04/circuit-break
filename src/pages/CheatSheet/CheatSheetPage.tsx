import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { GATE_EXPRESSIONS } from '@/components/learning/gateExpressions';
import { Button } from '@/components/ui/Button';
import { GateShape } from '@/features/board';
import { GATE_ARITY, truthTable, type GateType } from '@/features/simulation';
import styles from './CheatSheetPage.module.css';

const GATES: GateType[] = ['NOT', 'AND', 'OR', 'NAND', 'NOR', 'XOR'];
const INPUT_NAMES = ['A', 'B'];

/** All six gates on one page, made to fit one A4 sheet when printed. */
export default function CheatSheetPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" className={styles.noPrint} onClick={() => navigate('/learn')}>
          ← {t('practice.back')}
        </Button>
        <h1 className={styles.title}>{t('cheat.title')}</h1>
        <Button className={styles.noPrint} onClick={() => window.print()}>
          🖨 {t('cheat.print')}
        </Button>
      </header>
      <p className={styles.subtitle}>{t('cheat.subtitle')}</p>

      <div className={styles.grid}>
        {GATES.map((gate) => (
          <section key={gate} className={styles.gate} aria-labelledby={`cheat-${gate}`}>
            <div className={styles.gateHeader}>
              <svg className={styles.symbol} viewBox="-38 -28 76 56" aria-hidden="true">
                <GateShape gate={gate} />
              </svg>
              <div>
                <h2 id={`cheat-${gate}`} className={styles.gateName}>
                  {gate}
                </h2>
                <p className={styles.expression}>{GATE_EXPRESSIONS[gate]}</p>
              </div>
            </div>
            <p className={styles.rule}>{t(`cheat.gates.${gate}.trick`)}</p>

            <table className={styles.table}>
              <caption className={styles.srOnly}>{t('learn.truthTable')}</caption>
              <thead>
                <tr>
                  {INPUT_NAMES.slice(0, GATE_ARITY[gate]).map((name) => (
                    <th key={name} scope="col">
                      {name}
                    </th>
                  ))}
                  <th scope="col">Y</th>
                </tr>
              </thead>
              <tbody>
                {truthTable(gate).map((row) => (
                  <tr key={row.inputs.join('')}>
                    {row.inputs.map((bit, i) => (
                      <td key={i}>{bit}</td>
                    ))}
                    <td className={row.output === 1 ? styles.one : undefined}>{row.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className={styles.example}>
              <span aria-hidden="true">🌍 </span>
              {t(`cheat.gates.${gate}.example`)}
            </p>
          </section>
        ))}
      </div>

      <div className={styles.extras}>
        <section className={styles.box} aria-labelledby="cheat-symbols">
          <h2 id="cheat-symbols" className={styles.boxTitle}>
            {t('cheat.symbolsTitle')}
          </h2>
          <ul className={styles.list}>
            <li>
              <strong>A · B</strong> = A AND B
            </li>
            <li>
              <strong>A + B</strong> = A OR B ({t('cheat.notAdding')})
            </li>
            <li>
              <strong className={styles.overline}>A</strong> = NOT A
            </li>
            <li>
              <strong>A ⊕ B</strong> = A XOR B
            </li>
          </ul>
        </section>
        <section className={styles.box} aria-labelledby="cheat-tips">
          <h2 id="cheat-tips" className={styles.boxTitle}>
            {t('cheat.tipsTitle')}
          </h2>
          <ul className={styles.list}>
            <li>{t('cheat.tips.rows')}</li>
            <li>{t('cheat.tips.order')}</li>
            <li>{t('cheat.tips.middle')}</li>
            <li>{t('cheat.tips.bubble')}</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
