import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  sound: boolean;
  /** Shows 0 / 1 on every wire, so signals don't depend on colour alone. */
  colorBlind: boolean;
  setSound: (on: boolean) => void;
  setColorBlind: (on: boolean) => void;
}

/** Player settings, saved in the browser. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sound: true,
      colorBlind: false,
      setSound: (sound) => set({ sound }),
      setColorBlind: (colorBlind) => set({ colorBlind }),
    }),
    {
      name: 'cb.settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ sound, colorBlind }) => ({ sound, colorBlind }),
    },
  ),
);
