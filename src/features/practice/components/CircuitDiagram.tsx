import { useTranslation } from 'react-i18next';
import { GateShape } from '@/features/board';
import type { PracticeQuestion } from '../question';
import { layoutQuestion } from './diagramLayout';
import styles from './CircuitDiagram.module.css';

/** The question's circuit, drawn like an exam diagram: inputs on the left, Y on the right. */
export function CircuitDiagram({ question }: { question: PracticeQuestion }) {
  const { t } = useTranslation();
  const layout = layoutQuestion(question);

  return (
    <svg
      className={styles.svg}
      viewBox={`0 ${layout.top} ${layout.width} ${layout.height - layout.top}`}
      role="img"
      aria-label={t('practice.diagramLabel', {
        inputs: question.inputs.join(', '),
        gates: question.columns.map((column) => column.gate).join(', '),
      })}
    >
      {layout.wires.map((wire, index) => (
        <path key={index} className={styles.wire} d={wire.d} />
      ))}

      {layout.inputs.map((input) => (
        <g key={input.name}>
          <text className={styles.label} x={input.x - 10} y={input.y + 6} textAnchor="end">
            {input.name}
          </text>
          <circle className={styles.dot} cx={input.x} cy={input.y} r={4} />
        </g>
      ))}

      {layout.gates.map((gate) => (
        <g key={gate.name}>
          <g transform={`translate(${gate.x} ${gate.y})`}>
            <GateShape gate={gate.gate} />
          </g>
          <text className={styles.wireName} x={gate.x + 48} y={gate.y - 8} textAnchor="middle">
            {gate.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
