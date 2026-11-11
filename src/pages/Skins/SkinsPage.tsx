import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { CoinChip, SKINS, usePlayerStore } from '@/features/rewards';
import { cx } from '@/lib/cx';
import styles from './SkinsPage.module.css';

/** The coin shop: board themes to buy and put on. */
export default function SkinsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const coins = usePlayerStore((state) => state.coins);
  const owned = usePlayerStore((state) => state.ownedSkins);
  const current = usePlayerStore((state) => state.skin);
  const buySkin = usePlayerStore((state) => state.buySkin);
  const wearSkin = usePlayerStore((state) => state.wearSkin);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← {t('map.home')}
        </Button>
        <h1 className={styles.title}>{t('skins.title')}</h1>
        <CoinChip coins={coins} />
      </header>
      <p className={styles.intro}>{t('skins.intro')}</p>

      <ul className={styles.grid}>
        {SKINS.map((skin) => {
          const isOwned = owned.includes(skin.id);
          const inUse = current === skin.id;
          return (
            <li key={skin.id} className={cx(styles.card, inUse && styles.inUse)}>
              <svg className={styles.preview} viewBox="0 0 200 110" aria-hidden="true">
                <rect x="4" y="14" width="192" height="92" rx="14" fill="rgba(0,0,0,0.35)" />
                <rect x="4" y="4" width="192" height="92" rx="14" fill={skin.colors.board} />
                <path
                  d="M 30 30 H 90 V 50 H 120"
                  fill="none"
                  stroke={skin.colors.on}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 30 72 H 90 V 58 H 120 M 150 54 H 175"
                  fill="none"
                  stroke={skin.colors.trace}
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <rect x="118" y="38" width="34" height="30" rx="5" fill="#2b2b2b" />
                <circle cx="178" cy="54" r="10" fill={skin.colors.on} />
              </svg>
              <h2 className={styles.name}>{t(`skins.names.${skin.id}`)}</h2>
              {inUse ? (
                <p className={styles.status}>✓ {t('skins.inUse')}</p>
              ) : isOwned ? (
                <Button variant="secondary" onClick={() => wearSkin(skin.id)}>
                  {t('skins.use')}
                </Button>
              ) : (
                <Button onClick={() => buySkin(skin.id)} disabled={coins < skin.price}>
                  {t('skins.buy', { count: skin.price })}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
