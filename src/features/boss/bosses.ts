/** One district's boss. Names and taunts are in i18n "boss.bosses.<id>". */
export interface Boss {
  id: 'flicker' | 'lockjaw' | 'sparkstorm' | 'static' | 'overload';
  world: number;
  /** The clock is the rounds' par times added up, times this. Smaller = the boss walks faster. */
  timeFactor: number;
  /**
   * Confusion: every `every` seconds, all placed chips show "?" for `hide` seconds,
   * after a 2-second warning.
   */
  confusion?: { every: number; hide: number };
}

export const BOSSES: Boss[] = [
  { id: 'flicker', world: 1, timeFactor: 1.3 },
  { id: 'lockjaw', world: 2, timeFactor: 1.2 },
  { id: 'sparkstorm', world: 3, timeFactor: 1.1 },
  { id: 'static', world: 4, timeFactor: 1.1, confusion: { every: 15, hide: 3 } },
  { id: 'overload', world: 5, timeFactor: 1.0, confusion: { every: 12, hide: 5 } },
];

export function getBoss(world: number): Boss | undefined {
  return BOSSES.find((boss) => boss.world === world);
}
