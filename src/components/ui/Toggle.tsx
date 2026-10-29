import { cx } from '@/lib/cx';
import styles from './Toggle.module.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  onText: string;
  offText: string;
}

/** An on/off switch. */
export function Toggle({ checked, onChange, label, onText, offText }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cx(styles.toggle, checked && styles.on)}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} aria-hidden="true" />
      <span className={styles.text}>{checked ? onText : offText}</span>
    </button>
  );
}
