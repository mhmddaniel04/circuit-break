import { getLevel } from '@/levels';
import { buildHintPrompt } from '../hintPrompt';
import { buildHintRequest } from '../hintRequest';

const level = getLevel('w2-l4')!; // Safety Lock: Y = A AND (NOT B)

describe('buildHintPrompt', () => {
  it('tells the AI to stay short, describe gates by position, and keep the answer secret', () => {
    const { system } = buildHintPrompt(buildHintRequest(level, {}, 1, 'en'));
    expect(system).toMatch(/at most 2 sentences/);
    expect(system).toMatch(/Never use internal ids/);
    expect(system).toMatch(/Never give the full solution/);
    expect(system).toMatch(/Reply in English/);
  });

  it('asks for Bahasa Melayu with school terms', () => {
    const { system } = buildHintPrompt(buildHintRequest(level, {}, 1, 'ms'));
    expect(system).toMatch(/Reply in Bahasa Melayu/);
    expect(system).toMatch(/jadual kebenaran/);
  });

  it('gets stronger with each hint level', () => {
    expect(buildHintPrompt(buildHintRequest(level, {}, 1, 'en')).system).toMatch(/gentle/);
    expect(buildHintPrompt(buildHintRequest(level, {}, 3, 'en')).system).toMatch(/strong/);
  });

  it('describes the board without internal slot ids', () => {
    const { user } = buildHintPrompt(buildHintRequest(level, { s1: 'NOT', s2: 'OR' }, 2, 'en'));
    expect(user).toContain('gate 1 (middle-left) gets input from B; student placed NOT.');
    expect(user).toContain('gate 2 (top-centre) gets input from A and gate 1 (middle-left)');
    expect(user).toContain('Bulb Y is connected to gate 2');
    expect(user).toContain('A=0, B=0: bulb Y should be 0 but is 1');
    expect(user).toContain('gate 2 (top-centre) should be AND');
    expect(user).not.toMatch(/\bs[12]\b/);
  });
});
