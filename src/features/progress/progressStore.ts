import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeRecord, type LessonRecords, type LevelResult, type ProgressRecords } from './records';

interface ProgressState {
  levels: ProgressRecords;
  lessons: LessonRecords;
  /** Saves a result and returns true if it is the best score so far for that level. */
  recordResult: (levelId: string, result: LevelResult) => boolean;
  /** Marks a world's lesson as passed, which unlocks its levels. */
  completeLesson: (world: number) => void;
  resetProgress: () => void;
}

/** Player progress, saved in the browser (localStorage) so it survives a page refresh. */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      levels: {},
      lessons: {},

      recordResult: (levelId, result) => {
        const previous = get().levels[levelId];
        set({ levels: { ...get().levels, [levelId]: mergeRecord(previous, result) } });
        return !previous || result.score > previous.bestScore;
      },

      completeLesson: (world) => set({ lessons: { ...get().lessons, [world]: true } }),

      resetProgress: () => set({ levels: {}, lessons: {} }),
    }),
    {
      name: 'cb.progress',
      // Saves made before lessons existed have no `lessons` field; it simply starts empty.
      // Increase this (and add a `migrate` function) if the saved shape ever changes.
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ levels: state.levels, lessons: state.lessons }),
    },
  ),
);
