import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Placement } from '@/features/simulation';
import type { Level } from '@/levels';
import { requestHint } from './hintClient';
import { buildHintRequest } from './hintRequest';
import { MAX_HINTS } from './hintSchema';
import { planHint, smartHintText } from './smartHints';

export interface Hint {
  text: string;
  /**
   * 'level': the level's written hint. 'smart': worked out instantly by the game.
   * 'ai': written by Bit (Gemini) for this exact board.
   */
  source: 'level' | 'smart' | 'ai';
  /** The slot this hint is about. It glows on the board. */
  slotId?: string;
}

/**
 * Up to MAX_HINTS hints per level, each one stronger than the last. Hints 1 and 2 are instant
 * and work offline; hint 3 asks Bit's AI, and falls back to the game's own answer if the AI
 * is slow or unavailable, so the player is never left waiting.
 */
export function useHints(level: Level, lang: 'en' | 'ms') {
  const { t } = useTranslation();
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(false);

  const add = (hint: Hint) => setHints((current) => [...current, hint]);

  /** Resolves with true when a new hint was added. */
  const askHint = async (placement: Placement): Promise<boolean> => {
    if (loading || hints.length >= MAX_HINTS) return false;
    const step = hints.length + 1;

    if (step === 1) {
      add({ text: level.hint[lang], source: 'level' });
      return true;
    }

    const plan = planHint(level, placement);
    const slotId = plan.kind === 'solved' ? undefined : plan.slotId;
    if (step === 2 || plan.kind === 'solved') {
      add({ text: smartHintText(plan, 2, t), source: 'smart', slotId });
      return true;
    }

    setLoading(true);
    try {
      const text = await requestHint(buildHintRequest(level, placement, step, lang, slotId));
      add({ text, source: 'ai', slotId });
    } catch {
      add({ text: smartHintText(plan, 3, t), source: 'smart', slotId });
    } finally {
      setLoading(false);
    }
    return true;
  };

  return {
    hints,
    loading,
    askHint,
    canAskMore: hints.length < MAX_HINTS,
    /** The slot the latest hint points at, to make it glow. */
    focusSlot: [...hints].reverse().find((hint) => hint.slotId)?.slotId,
  };
}
