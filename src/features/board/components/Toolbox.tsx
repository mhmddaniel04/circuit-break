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
            <svg className={styles.icon} viewBox="-38 -28 76 56" aria-hidden="true">
              <GateShape gate={gate} />
            </svg>
            <span className={styles.name}>{gate}</span>
            <span className={styles.count}>{t('level.left', { count: remaining })}</span>
          </button>
        );
      })}
    </div>
  );
}
