import { useEffect, useRef } from 'react';
import type { BoardState } from '@/features/board';
import { playSound } from '@/features/settings';

const ERROR_MESSAGES = new Set(['wrongInputs', 'noneLeft', 'locked', 'emptySlots']);

/** Plays a sound whenever the board changes in a way the player should hear. */
export function useLevelSounds(state: BoardState): void {
  const previous = useRef(state);

  useEffect(() => {
    const before = previous.current;
    previous.current = state;
    if (before === state) return;

    if (state.result && state.result !== before.result) {
      playSound(state.result.solved ? 'success' : 'fail');
    } else if (
      state.message &&
      state.message !== before.message &&
      ERROR_MESSAGES.has(state.message.key)
    ) {
      playSound('error');
    } else if (state.placement !== before.placement) {
      const placedBefore = Object.keys(before.placement).length;
      const placedNow = Object.keys(state.placement).length;
      playSound(placedNow >= placedBefore ? 'place' : 'remove');
    } else if (state.selectedGate && state.selectedGate !== before.selectedGate) {
      playSound('select');
    }
  }, [state]);
}
