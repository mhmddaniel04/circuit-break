import { useEffect, useRef, useState } from 'react';
import { rewardChatQuestion } from '@/features/rewards';
import { ChatRequestError, cleanChatText, streamChat, type ChatError } from './chatClient';
import { MAX_HISTORY, MAX_QUESTION_LENGTH, type ChatMessage } from './chatSchema';

/**
 * A conversation with Bit. Messages live only in memory: nothing a student types is saved.
 * `world` is the lesson being read, or null on the gate reference page.
 */
export function useChat(world: number | null, lang: 'en' | 'ms') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Stop an answer that is still arriving when the chat closes.
  useEffect(() => () => abortRef.current?.abort(), []);

  /** Sends a question. Resolves with the question again if it failed, so it can be retried. */
  const send = async (question: string): Promise<string | undefined> => {
    const text = question.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!text || streaming) return undefined;

    const history: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages([...history, { role: 'bit', text: '' }]);
    setStreaming(true);
    setError(null);

    const showAnswer = (answer: string) =>
      setMessages([...history, { role: 'bit', text: cleanChatText(answer) }]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const answer = await streamChat(
        { lang, world, messages: history.slice(-MAX_HISTORY) },
        showAnswer,
        controller.signal,
      );
      showAnswer(answer);
      rewardChatQuestion();
    } catch (caught) {
      if (controller.signal.aborted) return undefined;
      // Remove the empty answer bubble and let the student try the same question again.
      setMessages(history.slice(0, -1));
      setError(caught instanceof ChatRequestError ? caught.reason : 'unavailable');
      return text;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setStreaming(false);
      }
    }
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
