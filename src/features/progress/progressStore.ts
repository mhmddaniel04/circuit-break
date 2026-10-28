import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mergeRecord, type LevelResult, type ProgressRecords } from './records';

interface ProgressState {
  levels: ProgressRecords;
  /** Saves a result and returns true if it is the best score so far for that level. */
  recordResult: (levelId: string, result: LevelResult) => boolean;
  resetProgress: () => void;
}

/** Player progress, saved in the browser (localStorage) so it survives a page refresh. */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      levels: {},

      recordResult: (levelId, result) => {
        const previous = get().levels[levelId];
        set({ levels: { ...get().levels, [levelId]: mergeRecord(previous, result) } });
        return !previous || result.score > previous.bestScore;
      },

      resetProgress: () => set({ levels: {} }),
    }),
    {
      name: 'cb.progress',
      // Increase this (and add a `migrate` function) if the saved shape ever changes.
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ levels: state.levels }),
    },
  ),
);
