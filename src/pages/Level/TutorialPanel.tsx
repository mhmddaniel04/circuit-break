import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import styles from './TutorialPanel.module.css';

interface TutorialPanelProps {
  steps: { en: string; ms: string }[];
}

/** Step-by-step instructions shown above the board on tutorial levels. */
export function TutorialPanel({ steps }: TutorialPanelProps) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(true);
  const lang = i18n.language === 'ms' ? 'ms' : 'en';

  if (!open) return null;
  const isLast = step === steps.length - 1;

  return (
    <aside className={styles.panel} aria-label={t('tutorial.label')}>
      <p className={styles.step}>
        {t('tutorial.step', { current: step + 1, total: steps.length })}
      </p>
      <p className={styles.text}>{steps[step][lang]}</p>
      <div className={styles.actions}>
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)}>
            {t('tutorial.back')}
          </Button>
        )}
        {isLast ? (
          <Button onClick={() => setOpen(false)}>{t('tutorial.done')}</Button>
        ) : (
          <Button onClick={() => setStep(step + 1)}>{t('tutorial.next')}</Button>
        )}
      </div>
    </aside>
  );
}
