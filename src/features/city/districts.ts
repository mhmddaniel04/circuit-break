import { isLessonDone, type LessonRecords, type ProgressRecords } from '@/features/progress';
import { getLevelsByWorld, LEVELS, type Level } from '@/levels';
import type { DistrictLook } from './isometric';

/** Every world is a district of the city. */
export const DISTRICTS = [1, 2, 3, 4, 5] as const;

export interface DistrictStatus {
  world: number;
  levels: Level[];
  /** How many of its levels are finished. */
  done: number;
  stars: number;
  lessonDone: boolean;
  /** The player can go there now: it is the first district, or the one before it is finished. */
  reachable: boolean;
  look: DistrictLook;
}

export function getDistrictStatus(
  world: number,
  records: ProgressRecords,
  lessons: LessonRecords,
): DistrictStatus {
  const levels = getLevelsByWorld(world);
  const done = levels.filter((level) => records[level.id] !== undefined).length;
  const stars = levels.reduce((sum, level) => sum + (records[level.id]?.stars ?? 0), 0);
  const previous = getLevelsByWorld(world - 1);
  const reachable =
    previous.length === 0 || records[previous[previous.length - 1].id] !== undefined;
  const look: DistrictLook =
    levels.length > 0 && done === levels.length
      ? 'powered'
      : reachable || done > 0
        ? 'active'
        : 'locked';

  return {
    world,
    levels,
    done,
    stars,
    lessonDone: isLessonDone(world, lessons, records, LEVELS),
    reachable,
    look,
  };
}

/** The district to show first: the first one that still needs work, or the last one. */
export function currentDistrict(statuses: DistrictStatus[]): number {
  return (statuses.find((status) => status.look !== 'powered') ?? statuses[statuses.length - 1])
    .world;
}
