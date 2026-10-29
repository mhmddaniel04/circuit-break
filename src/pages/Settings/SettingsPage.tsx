import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { useProgressStore } from '@/features/progress';
import { useSettingsStore } from '@/features/settings';
import styles from './SettingsPage.module.css';

const SHORTCUTS = [
  ['1 – 6', 'settings.keys.gates'],
  ['Tab', 'settings.keys.move'],
  ['Enter', 'settings.keys.place'],
  ['T', 'settings.keys.test'],
  ['Z', 'settings.keys.undo'],
  ['H', 'settings.keys.hint'],
] as const;

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { sound, colorBlind, setSound, setColorBlind } = useSettingsStore();
  const resetProgress = useProgressStore((state) => state.resetProgress);
  const [resetStep, setResetStep] = useState<'idle' | 'confirm' | 'done'>('idle');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('map.home')}
        </Button>
        <h1 className={styles.title}>{t('settings.title')}</h1>
      </header>

      <section className={styles.card}>
        <div className={styles.row}>
          <div>
            <h2 className={styles.name}>{t('settings.sound')}</h2>
            <p className={styles.help}>{t('settings.soundHelp')}</p>
          </div>
          <Toggle
            checked={sound}
            onChange={setSound}
            label={t('settings.sound')}
            onText={t('settings.on')}
            offText={t('settings.off')}
          />
        </div>

        <div className={styles.row}>
          <div>
            <h2 className={styles.name}>{t('settings.colorBlind')}</h2>
            <p className={styles.help}>{t('settings.colorBlindHelp')}</p>
          </div>
          <Toggle
            checked={colorBlind}
            onChange={setColorBlind}
            label={t('settings.colorBlind')}
            onText={t('settings.on')}
            offText={t('settings.off')}
          />
        </div>

        <div className={styles.row}>
          <h2 className={styles.name}>{t('settings.language')}</h2>
          <div className={styles.languages}>
            {(['en', 'ms'] as const).map((lang) => (
              <Button
                key={lang}
                variant={i18n.language === lang ? 'primary' : 'secondary'}
                aria-pressed={i18n.language === lang}
                onClick={() => i18n.changeLanguage(lang)}
              >
                {lang === 'en' ? 'English' : 'Bahasa Melayu'}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.name}>{t('settings.keyboard')}</h2>
        <dl className={styles.shortcuts}>
          {SHORTCUTS.map(([key, text]) => (
            <div key={key} className={styles.shortcut}>
              <dt>
                <kbd className={styles.key}>{key}</kbd>
              </dt>
              <dd>{t(text)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.card}>
        <div className={styles.row}>
          <div>
            <h2 className={styles.name}>{t('settings.reset')}</h2>
            <p className={styles.help}>{t('settings.resetHelp')}</p>
          </div>
          {resetStep === 'idle' && (
            <Button variant="secondary" onClick={() => setResetStep('confirm')}>
              {t('settings.reset')}
            </Button>
          )}
        </div>
        {resetStep === 'confirm' && (
          <div className={styles.confirm} role="alert">
            <p>{t('settings.resetConfirm')}</p>
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setResetStep('idle')}>
                {t('settings.cancel')}
              </Button>
              <Button
                className={styles.danger}
                onClick={() => {
                  resetProgress();
                  setResetStep('done');
                }}
              >
                {t('settings.resetYes')}
              </Button>
            </div>
          </div>
        )}
        {resetStep === 'done' && (
          <p className={styles.done} role="status">
            {t('settings.resetDone')}
          </p>
        )}
      </section>
    </main>
  );
}
