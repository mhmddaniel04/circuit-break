import type { Placement } from '@/features/simulation';
import { parseLevel, type Level } from './schema';

export type { Level } from './schema';

// Loads every JSON file in the world folders automatically: adding a level = adding a file.
const files = import.meta.glob<unknown>('./world*/*.json', { eager: true, import: 'default' });

export const LEVELS: readonly Level[] = Object.entries(files)
  .map(([path, data]) => {
    try {
      return parseLevel(data);
    } catch (error) {
      throw new Error(`Invalid level file ${path}: ${(error as Error).message}`);
    }
  })
  .sort((a, b) => a.world - b.world || a.order - b.order);

export function getLevel(id: string): Level | undefined {
  return LEVELS.find((level) => level.id === id);
}

export function getLevelsByWorld(world: number): Level[] {
  return LEVELS.filter((level) => level.world === world);
}

/** Gates that are already on the board when the level starts (repair levels). */
export function getInitialPlacement(level: Level): Placement {
  return Object.fromEntries(
    level.slots.flatMap((slot) => (slot.initialGate ? [[slot.id, slot.initialGate] as const] : [])),
  );
}
