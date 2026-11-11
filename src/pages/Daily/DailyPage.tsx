import { useState } from 'react';
import { buildDailyLevel, todayKey } from '@/features/daily';
import { LevelView } from '../Level/LevelView';

/** Today's daily challenge: the same new circuit for every player, changing at midnight. */
export default function DailyPage() {
  const [today] = useState(() => todayKey());
  const [level] = useState(() => buildDailyLevel(today));
  // Changing this number restarts the puzzle (used by "Play again").
  const [run, setRun] = useState(0);

  return (
    <LevelView key={run} level={level} mode="daily" onReplay={() => setRun((count) => count + 1)} />
  );
}
