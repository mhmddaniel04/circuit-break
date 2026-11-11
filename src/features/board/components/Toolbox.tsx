import { useTranslation } from 'react-i18next';
import type { GateType, Placement } from '@/features/simulation';
import type { Level } from '@/levels';
import { cx } from '@/lib/cx';
import { getRemaining } from '../boardReducer';
import { GATE_DRAG_TYPE } from '../gateDrag';
import { GateShape } from './GateShape';
import styles from './Toolbox.module.css';

interface ToolboxProps {
  level: Level;
  placement: Placement;
  selectedGate: GateType | null;
  onSelect: (gate: GateType) => void;
}

/** The gates the player can use. Tap one to select it, or drag it onto a slot. */
export function Toolbox({ level, placement, selectedGate, onSelect }: ToolboxProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.toolbox} role="toolbar" aria-label={t('level.toolbox')}>
      {level.toolbox.map(({ gate }) => {
        const remaining = getRemaining(level, placement, gate);
        return (
          <button
            key={gate}
            type="button"
            className={cx(styles.gate, selectedGate === gate && styles.selected)}
            aria-pressed={selectedGate === gate}
            disabled={remaining === 0}
            draggable={remaining > 0}
            onClick={() => onSelect(gate)}
            onDragStart={(event) => {
              event.dataTransfer.setData(GATE_DRAG_TYPE, gate);
              event.dataTransfer.effectAllowed = 'copy';
            }}
          >
            <svg className={styles.icon} viewBox="-36 -26 72 54" aria-hidden="true">
              {/* The same black chip that goes on the board. */}
              {[-12, 0, 12].map((y) => (
                <g key={y} className={styles.pin}>
                  <rect x={-33} y={y - 3} width={8} height={6} rx={1.5} />
                  <rect x={25} y={y - 3} width={8} height={6} rx={1.5} />
                </g>
              ))}
              <rect className={styles.chipEdge} x={-26} y={-16} width={52} height={38} rx={6} />
              <rect className={styles.chipTop} x={-26} y={-22} width={52} height={38} rx={6} />
              <g transform="translate(0 -3) scale(0.62)">
                <GateShape gate={gate} variant="chip" />
              </g>
            </svg>
            <span className={styles.name}>{gate}</span>
            <span className={styles.count}>{t('level.left', { count: remaining })}</span>
          </button>
        );
      })}
    </div>
  );
}
