import type { Placement } from '@/features/simulation';
import { parseLevelFile, type Level } from './schema';

export type { Level } from './schema';

// Loads every world file automatically: data/world1.json, data/world2.json, ...
const files = import.meta.glob<unknown>('./data/*.json', { eager: true, import: 'default' });

export const LEVELS: readonly Level[] = Object.entries(files)
  .flatMap(([path, data]) => {
    try {
      return parseLevelFile(data);
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

/** The level that comes after `id`, or undefined if it is the last one. */
export function getNextLevel(id: string): Level | undefined {
  const index = LEVELS.findIndex((level) => level.id === id);
  return index === -1 ? undefined : LEVELS[index + 1];
}

/** Gates that are already on the board when the level starts (repair levels). */
export function getInitialPlacement(level: Level): Placement {
  return Object.fromEntries(
    level.slots.flatMap((slot) => (slot.initialGate ? [[slot.id, slot.initialGate] as const] : [])),
  );
}
