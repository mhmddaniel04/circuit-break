import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rewardChatQuestion } from '@/features/rewards';
import { ChatRequestError, cleanChatText, streamChat, type ChatError } from './chatClient';
import {
  MAX_HISTORY,
  MAX_QUESTION_LENGTH,
  MAX_REFERENCE_LENGTH,
  type ChatMessage,
} from './chatSchema';
import { findFaqAnswer, relatedFaqAnswers } from './faq';

/** If the AI has not started answering by now, stop waiting and use the answer bank instead. */
export const FIRST_WORDS_TIMEOUT_MS = 12_000;

/**
 * Bit's conversation. Common questions are answered instantly from the answer bank (no
 * internet needed); anything else goes to the AI, with the closest bank notes as a reference.
 */
export function useChat(world: number | null, lang: 'en' | 'ms') {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  /** Sends a question. Resolves with the question if it failed, so it can go back in the box. */
  const send = async (question: string): Promise<string | undefined> => {
    const text = question.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!text || streaming) return undefined;

    const history: ChatMessage[] = [...messages, { role: 'user', text }];
    setError(null);

    const instant = findFaqAnswer(text, lang);
    if (instant) {
      setMessages([...history, { role: 'bit', text: instant, source: 'faq' }]);
      rewardChatQuestion();
      return undefined;
    }

    setMessages([...history, { role: 'bit', text: '' }]);
    setStreaming(true);
    const showAnswer = (answer: string) =>
      setMessages([...history, { role: 'bit', text: cleanChatText(answer), source: 'ai' }]);

    const related = relatedFaqAnswers(text, lang);
    const controller = new AbortController();
    abortRef.current = controller;
    let tooSlow = false;
    const timer = setTimeout(() => {
      tooSlow = true;
      controller.abort();
    }, FIRST_WORDS_TIMEOUT_MS);

    try {
      const answer = await streamChat(
        {
          lang,
          world,
          messages: history.slice(-MAX_HISTORY).map(({ role, text }) => ({ role, text })),
          reference: related.map((note) => note.slice(0, MAX_REFERENCE_LENGTH)),
        },
        (answerSoFar) => {
          clearTimeout(timer);
          showAnswer(answerSoFar);
        },
        controller.signal,
      );
      showAnswer(answer);
      rewardChatQuestion();
    } catch (caught) {
      if (controller.signal.aborted && !tooSlow) return undefined;
      if (tooSlow && related.length > 0) {
        setMessages([
          ...history,
          { role: 'bit', text: `${t('chat.slowNote')}\n${related[0]}`, source: 'faq' },
        ]);
        return undefined;
      }
      setMessages(history.slice(0, -1));
      setError(
        tooSlow ? 'slow' : caught instanceof ChatRequestError ? caught.reason : 'unavailable',
      );
      return text;
    } finally {
      clearTimeout(timer);
      if (abortRef.current === controller) {
        abortRef.current = null;
        setStreaming(false);
      }
    }
    return undefined;
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStreaming(false);
    setError(null);
  };

  return { messages, streaming, error, send, reset };
}
