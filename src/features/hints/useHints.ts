import { useState } from 'react';
import type { Placement } from '@/features/simulation';
import type { Level } from '@/levels';
import { requestHint } from './hintClient';
import { buildHintRequest } from './hintRequest';
import { MAX_HINTS } from './hintSchema';

export interface Hint {
  text: string;
  /** 'ai' = written by Bit for this board; 'fallback' = the level's written hint (offline). */
  source: 'ai' | 'fallback';
}

/** Up to MAX_HINTS hints per level, each one stronger than the last. */
export function useHints(level: Level, lang: 'en' | 'ms') {
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  /** Resolves with true when a new hint was added, false when none could be given. */
  const askHint = async (placement: Placement): Promise<boolean> => {
    if (loading || hints.length >= MAX_HINTS) return false;
    setLoading(true);
    setFailed(false);
    try {
      const text = await requestHint(buildHintRequest(level, placement, hints.length + 1, lang));
      setHints((current) => [...current, { text, source: 'ai' }]);
      return true;
    } catch {
      // No connection or no API key: show the level's written hint once, then report the problem.
      if (hints.some((hint) => hint.source === 'fallback')) {
        setFailed(true);
        return false;
      }
      setHints((current) => [...current, { text: level.hint[lang], source: 'fallback' }]);
      return true;
    } finally {
      setLoading(false);
    }
  };

  return { hints, loading, failed, askHint, canAskMore: hints.length < MAX_HINTS };
}
