import { getLevelsByWorld, isBossLevel } from '@/levels';
import {
  attackFor,
  BASE_DAMAGE,
  battleRounds,
  battleStars,
  battleTimeLimit,
  BOSS_HP,
  confusionAt,
  MAX_SPEED_BONUS,
} from '../battle';
import { BOSSES, getBoss } from '../bosses';

describe('bosses', () => {
  it('has one boss for each district', () => {
    expect(BOSSES.map((boss) => boss.world)).toEqual([1, 2, 3, 4, 5]);
  });

  it('gives confusion only to the bosses of the last two districts', () => {
    expect(BOSSES.filter((boss) => boss.confusion).map((boss) => boss.world)).toEqual([4, 5]);
  });
});

describe('battleRounds', () => {
  it.each([1, 2, 3, 4, 5])('ends District %i with its boss level', (world) => {
    const rounds = battleRounds(world);
    expect(rounds).toHaveLength(4);
    expect(isBossLevel(rounds[3])).toBe(true);
    expect(rounds.slice(0, 3)).toEqual(getLevelsByWorld(world).slice(-4, -1));
  });
});

describe('battleTimeLimit', () => {
  it('adds up the rounds par times and scales them by the boss', () => {
    // District 1: 30 + 40 + 40 + 45 = 155 seconds of par, times 1.3.
    expect(battleTimeLimit(getBoss(1)!)).toBe(202);
  });
});

describe('attackFor', () => {
  it('hits harder for a fast solve, with a critical hit when very fast', () => {
    expect(attackFor(0, 40)).toEqual({ damage: BASE_DAMAGE + MAX_SPEED_BONUS, critical: true });
    expect(attackFor(20, 40)).toEqual({ damage: 33, critical: true });
    expect(attackFor(40, 40)).toEqual({ damage: BASE_DAMAGE, critical: false });
    expect(attackFor(300, 40)).toEqual({ damage: BASE_DAMAGE, critical: false });
  });

  it('needs at least 3 fast hits or 4 slow hits to defeat a boss', () => {
    expect(BOSS_HP / (BASE_DAMAGE + MAX_SPEED_BONUS)).toBeGreaterThan(2);
    expect(BOSS_HP / BASE_DAMAGE).toBe(4);
  });
});

describe('battleStars', () => {
  it('gives more stars for more time left', () => {
    expect(battleStars(100, 200)).toBe(3);
    expect(battleStars(60, 200)).toBe(2);
    expect(battleStars(10, 200)).toBe(1);
  });
});

describe('confusionAt', () => {
  const staticBoss = getBoss(4)!; // every 15 s, hides for 3 s

  it('warns, then hides the chips, then clears again', () => {
    expect(confusionAt(5, staticBoss)).toBe('clear');
    expect(confusionAt(10.5, staticBoss)).toBe('warning');
    expect(confusionAt(12.5, staticBoss)).toBe('confused');
    expect(confusionAt(16, staticBoss)).toBe('clear');
  });

  it('never confuses on bosses without the power', () => {
    expect(confusionAt(13, getBoss(1)!)).toBe('clear');
  });
});
