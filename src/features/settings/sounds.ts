import { useSettingsStore } from './settingsStore';

export type SoundName = 'select' | 'place' | 'remove' | 'error' | 'fail' | 'success';

/** Each sound is a few short notes: [frequency in Hz, start time in s, length in s]. */
const SOUNDS: Record<SoundName, Array<[number, number, number]>> = {
  select: [[660, 0, 0.06]],
  place: [
    [520, 0, 0.06],
    [780, 0.05, 0.08],
  ],
  remove: [
    [520, 0, 0.06],
    [350, 0.05, 0.08],
  ],
  error: [[180, 0, 0.18]],
  fail: [
    [330, 0, 0.15],
    [247, 0.15, 0.25],
  ],
  success: [
    [523, 0, 0.12],
    [659, 0.12, 0.12],
    [784, 0.24, 0.12],
    [1047, 0.36, 0.3],
  ],
};

let context: AudioContext | null = null;

/**
 * Plays a short beep made in the browser (no sound files needed).
 * Does nothing when sound is off or the browser has no Web Audio.
 */
export function playSound(name: SoundName): void {
  if (!useSettingsStore.getState().sound) return;
  if (typeof AudioContext === 'undefined') return;

  try {
    context ??= new AudioContext();
    const now = context.currentTime;
    for (const [frequency, start, length] of SOUNDS[name]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = name === 'error' ? 'square' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.12, now + start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + start);
      oscillator.stop(now + start + length);
    }
  } catch {
    // Audio is a nice extra; never let it break the game.
  }
}

/** For tests. */
export function resetSoundContext(): void {
  context = null;
}
