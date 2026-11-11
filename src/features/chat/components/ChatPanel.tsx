import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { BitAvatar } from '@/components/ui/BitAvatar';
import { Button } from '@/components/ui/Button';
import { cx } from '@/lib/cx';
import { MAX_QUESTION_LENGTH } from '../chatSchema';
import { useChat } from '../useChat';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  /** The lesson being read, or null on the gate reference page. */
  world: number | null;
}

/** The "Ask Bit" button and chat window, for questions about logic gates. */
export function ChatPanel({ world }: ChatPanelProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ms' ? 'ms' : 'en';
  const chat = useChat(world, lang);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const panelId = useId();

  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const suggestions = t(`chat.suggestions.${world ?? 'general'}`, {
    returnObjects: true,
  }) as string[];

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest words in view while an answer streams in.
  const lastText = chat.messages[chat.messages.length - 1]?.text;
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [chat.messages.length, lastText, chat.error]);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  const ask = async (question: string) => {
    setDraft('');
    const failed = await chat.send(question);
    // Put a question that could not be sent back in the box, so it is not lost.
    if (failed) setDraft(failed);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(draft);
  };

  // Enter sends, Shift+Enter starts a new line.
  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void ask(draft);
    }
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className={cx(styles.launcher, open && styles.launcherHidden)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <BitAvatar className={styles.launcherBit} />
        <span className={styles.launcherText}>{t('chat.open')}</span>
      </button>

      {open && (
        <section
          id={panelId}
          className={styles.panel}
          role="dialog"
          aria-labelledby={`${panelId}-title`}
          onKeyDown={(event) => event.key === 'Escape' && close()}
        >
          <header className={styles.header}>
            <BitAvatar className={styles.headerBit} mood={chat.streaming ? 'thinking' : 'happy'} />
            <div className={styles.headerText}>
              <h2 id={`${panelId}-title`} className={styles.title}>
                {t('chat.title')}
              </h2>
              <p className={styles.subtitle}>{t('chat.subtitle')}</p>
            </div>
            {chat.messages.length > 0 && (
              <button type="button" className={styles.headerButton} onClick={chat.reset}>
                {t('chat.newChat')}
              </button>
            )}
            <button
              type="button"
              className={styles.headerButton}
              aria-label={t('chat.close')}
              onClick={close}
            >
              ✕
            </button>
          </header>

          <div ref={logRef} className={styles.log} role="log" aria-live="polite">
            <p className={cx(styles.message, styles.bit)}>{t('chat.welcome')}</p>

            {chat.messages.map((message, index) =>
              message.role === 'bit' && message.text === '' ? (
                <p key={index} className={cx(styles.message, styles.bit, styles.thinking)}>
                  {t('chat.thinking')}
                </p>
              ) : (
                <p
                  key={index}
                  className={cx(styles.message, message.role === 'user' ? styles.user : styles.bit)}
                >
                  <span className={styles.srOnly}>
                    {message.role === 'user' ? t('chat.you') : t('chat.bit')}:{' '}
                  </span>
                  {message.role === 'bit' ? <BitText text={message.text} /> : message.text}
                </p>
              ),
            )}

            {chat.messages.length === 0 && (
              <div className={styles.suggestions}>
                <p className={styles.suggestionsLabel}>{t('chat.tryAsking')}</p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={styles.suggestion}
                    onClick={() => void ask(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {chat.error && (
              <p className={styles.error} role="alert">
                {t(`chat.errors.${chat.error}`)}
              </p>
            )}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <textarea
              ref={inputRef}
              className={styles.input}
              value={draft}
              rows={2}
              maxLength={MAX_QUESTION_LENGTH}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <Button type="submit" disabled={chat.streaming || draft.trim() === ''}>
              {t('chat.send')}
            </Button>
          </form>
          <p className={styles.disclaimer}>
            {draft.length > MAX_QUESTION_LENGTH - 50 &&
              `${draft.length} / ${MAX_QUESTION_LENGTH} · `}
            {t('chat.disclaimer')}
          </p>
        </section>
      )}
    </>
  );
}

/** Bit's answer. Truth-table lines (with "|") use a monospace font so their columns line up. */
function BitText({ text }: { text: string }) {
  const lines = text.split('\n');
  return lines.map((line, index) => (
    <span key={index} className={line.includes('|') ? styles.mono : undefined}>
      {line}
      {index < lines.length - 1 && '\n'}
    </span>
  ));
}
