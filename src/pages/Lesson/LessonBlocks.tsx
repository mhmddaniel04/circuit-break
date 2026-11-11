import { useTranslation } from 'react-i18next';
import { GateCard } from '@/components/learning/GateCard';
import type { LessonBlock } from '@/lessons';
import styles from './LessonPage.module.css';

/** Draws the blocks of one lesson step: paragraphs, "Remember" boxes and gate cards. */
export function LessonBlocks({ blocks, lang }: { blocks: LessonBlock[]; lang: 'en' | 'ms' }) {
  const { t } = useTranslation();

  return blocks.map((block, index) => {
    switch (block.type) {
      case 'text':
        return block.body[lang].split(/\n\s*\n/).map((paragraph, i) => (
          <p key={`${index}-${i}`} className={styles.text}>
            {paragraph}
          </p>
        ));
      case 'tip':
        return (
          <aside key={index} className={styles.tip}>
            <p className={styles.tipLabel}>💡 {t('lesson.remember')}</p>
            <p className={styles.tipText}>{block.body[lang]}</p>
          </aside>
        );
      case 'gate':
        return <GateCard key={index} gate={block.gate} headingLevel={3} />;
    }
  });
}
