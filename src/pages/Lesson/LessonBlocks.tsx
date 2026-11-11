import { useTranslation } from 'react-i18next';
import { GateCard } from '@/components/learning/GateCard';
import { BitAvatar } from '@/components/ui/BitAvatar';
import type { LessonBlock } from '@/lessons';
import { CircuitBlock } from './blocks/CircuitBlock';
import styles from './blocks/blocks.module.css';
import { FillTableBlock } from './blocks/FillTableBlock';
import { PredictBlock } from './blocks/PredictBlock';

/** Draws the blocks of one lesson step. Add a case here for each new block type. */
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
            <p className={styles.blockLabel}>💡 {t('lesson.remember')}</p>
            <p className={styles.tipText}>{block.body[lang]}</p>
          </aside>
        );
      case 'story':
        return (
          <aside key={index} className={styles.story}>
            <span className={styles.storyIcon} aria-hidden="true">
              {block.icon}
            </span>
            <div>
              <p className={styles.blockLabel}>{t('lesson.realLife')}</p>
              <h3 className={styles.storyTitle}>{block.title[lang]}</h3>
              <p className={styles.storyText}>{block.body[lang]}</p>
            </div>
          </aside>
        );
      case 'fact':
        return (
          <aside key={index} className={styles.fact}>
            <p className={styles.blockLabel}>🧠 {t('lesson.didYouKnow')}</p>
            <p className={styles.factText}>{block.body[lang]}</p>
          </aside>
        );
      case 'bit':
        return (
          <div key={index} className={styles.bit}>
            <BitAvatar className={styles.bitAvatar} mood="explaining" />
            <p className={styles.bitBubble}>
              <span className={styles.srOnly}>{t('chat.bit')}: </span>
              {block.body[lang]}
            </p>
          </div>
        );
      case 'gate':
        return (
          <GateCard key={index} gate={block.gate} headingLevel={3} className={styles.gateCard} />
        );
      case 'circuit':
        return <CircuitBlock key={index} gate={block.gate} />;
      case 'predict':
        return <PredictBlock key={index} gate={block.gate} inputs={block.inputs} />;
      case 'fillTable':
        return <FillTableBlock key={index} gate={block.gate} />;
    }
  });
}
