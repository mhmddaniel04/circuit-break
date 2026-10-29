import { useEffect, useRef } from 'react';

/**
 * Calls handlers[key] when that key is pressed (for example { t: test, z: undo }).
 * Ignored while typing in a text field or when Ctrl/Alt/Cmd is held.
 */
export function useKeyboardShortcuts(handlers: Record<string, () => void>, enabled = true): void {
  // Keep the latest handlers without re-adding the listener on every render.
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const handler = latest.current[event.key.toLowerCase()];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
