import { computeScore, computeStars, SCORE } from '../scoring';

describe('computeStars', () => {
  it('gives 3 stars for a first-try solve without a hint', () => {
    expect(computeStars({ attempts: 1, hintUsed: false })).toBe(3);
  });

  it('gives 2 stars when it took more than one test', () => {
    expect(computeStars({ attempts: 3, hintUsed: false })).toBe(2);
  });

  it('gives 1 star when a hint was used', () => {
    expect(computeStars({ attempts: 1, hintUsed: true })).toBe(1);
  });
});

describe('computeScore', () => {
  const perfect = { attempts: 1, hintUsed: false, seconds: 30, parSeconds: 30 };

  it('gives the base score for a first-try solve on par time', () => {
    expect(computeScore(perfect)).toBe(SCORE.base);
  });

  it('adds a bonus for each second under par', () => {
    expect(computeScore({ ...perfect, seconds: 20 })).toBe(SCORE.base + 10 * 10);
  });

  it('takes points off for wrong tests and hints', () => {
    expect(computeScore({ ...perfect, attempts: 3, hintUsed: true })).toBe(
      SCORE.base - 2 * SCORE.wrongTestPenalty - SCORE.hintPenalty,
    );
  });

  it('never goes below the minimum', () => {
    expect(computeScore({ ...perfect, attempts: 50, hintUsed: true })).toBe(SCORE.minimum);
  });
});
