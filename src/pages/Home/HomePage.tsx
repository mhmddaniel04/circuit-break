import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const nextLanguage = i18n.language === 'en' ? 'ms' : 'en';

  return (
    <main className={styles.page}>
      <button
        type="button"
        className={styles.langToggle}
        onClick={() => i18n.changeLanguage(nextLanguage)}
        aria-label={t('home.switchLanguage')}
      >
        {nextLanguage.toUpperCase()}
      </button>

      <header className={styles.header}>
        <h1 className={styles.title}>{t('app.title')}:</h1>
        <h2 className={styles.subtitle}>{t('app.subtitle')}</h2>
      </header>

      <nav className={styles.menu}>
        <button type="button" className={styles.menuButton} onClick={() => navigate('/worlds')}>
          {t('home.play')}
        </button>
        <button type="button" className={styles.menuButton} onClick={() => navigate('/learn')}>
          {t('home.learn')}
        </button>
        <button type="button" className={styles.menuButton} onClick={() => navigate('/settings')}>
          {t('home.settings')}
        </button>
      </nav>
    </main>
  );
}
