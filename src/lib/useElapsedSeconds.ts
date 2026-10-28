import { useEffect, useState } from 'react';

/** Seconds since `startedAt`, updated every second while `running` is true. */
export function useElapsedSeconds(startedAt: number, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  return Math.max(0, Math.floor((now - startedAt) / 1000));
}
