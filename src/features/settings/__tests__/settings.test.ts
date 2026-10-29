import { useSettingsStore } from '../settingsStore';
import { playSound, resetSoundContext } from '../sounds';

function fakeAudioContext() {
  const node = () => ({ connect: vi.fn((next) => next), start: vi.fn(), stop: vi.fn() });
  const created: unknown[] = [];
  class FakeAudioContext {
    currentTime = 0;
    destination = {};
    constructor() {
      created.push(this);
    }
    createOscillator() {
      return { ...node(), type: 'sine', frequency: { value: 0 } };
    }
    createGain() {
      return {
        ...node(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      };
    }
  }
  vi.stubGlobal('AudioContext', FakeAudioContext);
  return created;
}

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ sound: true, colorBlind: false });
  });

  it('starts with sound on and colour-blind mode off', () => {
    expect(useSettingsStore.getState()).toMatchObject({ sound: true, colorBlind: false });
  });

  it('saves changes in the browser', () => {
    useSettingsStore.getState().setSound(false);
    useSettingsStore.getState().setColorBlind(true);
    expect(JSON.parse(localStorage.getItem('cb.settings')!).state).toEqual({
      sound: false,
      colorBlind: true,
    });
  });
});

describe('playSound', () => {
  beforeEach(() => {
    resetSoundContext();
    useSettingsStore.setState({ sound: true });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('plays through Web Audio when sound is on', () => {
    const created = fakeAudioContext();
    playSound('success');
    expect(created).toHaveLength(1);
  });

  it('stays silent when sound is off', () => {
    const created = fakeAudioContext();
    useSettingsStore.setState({ sound: false });
    playSound('success');
    expect(created).toHaveLength(0);
  });

  it('does nothing in a browser without Web Audio', () => {
    vi.stubGlobal('AudioContext', undefined);
    expect(() => playSound('place')).not.toThrow();
  });
});
