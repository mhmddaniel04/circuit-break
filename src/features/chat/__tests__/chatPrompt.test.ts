import { buildChatPrompt } from '../chatPrompt';
import type { ChatRequest } from '../chatSchema';

const request: ChatRequest = {
  lang: 'en',
  world: 3,
  messages: [
    { role: 'bit', text: 'Hi!' },
    { role: 'user', text: 'What is OR?' },
    { role: 'bit', text: 'OR gives 1 when any input is 1.' },
    { role: 'user', text: 'And XOR?' },
  ],
};

describe('buildChatPrompt', () => {
  it('tells Bit which lesson the student is reading', () => {
    expect(buildChatPrompt(request).system).toContain('World 3 lesson about the OR gate');
    expect(buildChatPrompt({ ...request, world: null }).system).toContain('gate reference page');
  });

  it('keeps Bit on topic and short', () => {
    const { system } = buildChatPrompt(request);
    expect(system).toMatch(/only help with logic gates/i);
    expect(system).toMatch(/at most 80 words/i);
    expect(system).toMatch(/do not solve the game levels/i);
  });

  it('answers in Bahasa Melayu when the game is in BM', () => {
    expect(buildChatPrompt({ ...request, lang: 'ms' }).system).toContain('Reply in Bahasa Melayu');
  });

  it('turns the conversation into Gemini turns that start with the student', () => {
    expect(buildChatPrompt(request).turns).toEqual([
      { role: 'user', text: 'What is OR?' },
      { role: 'model', text: 'OR gives 1 when any input is 1.' },
      { role: 'user', text: 'And XOR?' },
    ]);
  });
});
