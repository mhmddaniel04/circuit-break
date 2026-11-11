// @vitest-environment node
import { ApiError } from '@google/genai';
import {
  DEFAULT_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  FAST_THINKING,
  resetFastThinking,
  withFastThinking,
  withModelFallback,
} from '../gemini.js';

const rejected = () => new ApiError({ message: 'thinking_level is not supported', status: 400 });

describe('withFastThinking', () => {
  beforeEach(() => resetFastThinking());

  it('uses the newest fast setting when the model accepts it', async () => {
    const run = vi.fn(async () => 'answer');
    expect(await withFastThinking(run)).toBe('answer');
    expect(run).toHaveBeenCalledWith(FAST_THINKING[0]);
  });

  it('tries older settings when the model rejects one, and remembers the one that works', async () => {
    const run = vi.fn(async (config: unknown) => {
      if (config === FAST_THINKING[0]) throw rejected();
      return 'answer';
    });
    expect(await withFastThinking(run)).toBe('answer');
    expect(run).toHaveBeenLastCalledWith(FAST_THINKING[1]);

    run.mockClear();
    await withFastThinking(run);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(FAST_THINKING[1]);
  });

  it('gives up after the last setting', async () => {
    const run = vi.fn(async () => {
      throw rejected();
    });
    await expect(withFastThinking(run)).rejects.toThrow('not supported');
    expect(run).toHaveBeenCalledTimes(FAST_THINKING.length);
  });

  it('does not retry other errors, such as a wrong API key', async () => {
    const run = vi.fn(async () => {
      throw new ApiError({ message: 'API key not valid', status: 403 });
    });
    await expect(withFastThinking(run)).rejects.toThrow('API key');
    expect(run).toHaveBeenCalledTimes(1);
  });
});

describe('withModelFallback', () => {
  beforeEach(() => resetFastThinking());
  const missing = () => new ApiError({ message: 'model not found', status: 404 });

  it('uses the fast default model when it works', async () => {
    const run = vi.fn(async (model: string) => model);
    expect(await withModelFallback(DEFAULT_GEMINI_MODEL, run)).toBe(DEFAULT_GEMINI_MODEL);
  });

  it('switches to the fallback model once if the default is missing', async () => {
    const run = vi.fn(async (model: string) => {
      if (model === DEFAULT_GEMINI_MODEL) throw missing();
      return model;
    });
    expect(await withModelFallback(DEFAULT_GEMINI_MODEL, run)).toBe(FALLBACK_GEMINI_MODEL);
    run.mockClear();
    await withModelFallback(DEFAULT_GEMINI_MODEL, run);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(FALLBACK_GEMINI_MODEL);
  });

  it('never replaces a model chosen with GEMINI_MODEL', async () => {
    const run = vi.fn(async () => {
      throw missing();
    });
    await expect(withModelFallback('my-model', run)).rejects.toThrow('not found');
    expect(run).toHaveBeenCalledTimes(1);
  });
});
