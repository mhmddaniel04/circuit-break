import { formatTime } from '../formatTime';

describe('formatTime', () => {
  it('formats seconds as minutes:seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(9)).toBe('0:09');
    expect(formatTime(75)).toBe('1:15');
    expect(formatTime(600)).toBe('10:00');
  });
});
