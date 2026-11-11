import { describe, expect, it } from 'vitest';
import en from '@/i18n/en.json';
import ms from '@/i18n/ms.json';
import { FAQ, findFaqAnswer, relatedFaqAnswers, tokenize } from '../faq';

const idOf = (question: string) => {
  const answer = findFaqAnswer(question, 'en');
  return FAQ.find((entry) => entry.answer.en === answer)?.id ?? null;
};

describe('answer bank', () => {
  it('has an answer for every suggested question, in both languages', () => {
    for (const [lang, file] of [
      ['en', en],
      ['ms', ms],
    ] as const) {
      for (const list of Object.values(file.chat.suggestions)) {
        for (const question of list) {
          expect(findFaqAnswer(question, lang), `${lang}: ${question}`).not.toBeNull();
        }
      }
    }
  });

  it.each([
    ['What is the difference between OR and XOR?', 'orVsXor'],
    ['Apakah perbezaan antara OR dan XOR?', 'orVsXor'],
    ['AND vs OR', 'andVsOr'],
    ['what is the and gate', 'andWhat'],
    ['Why is 1 + 1 = 1 in logic?', 'onePlusOne'],
    ['How does a half adder add 1 + 1?', 'halfAdder'],
    ['What happens with three NOT gates in a row?', 'notChain'],
    ['How do I check three inputs with AND?', 'andThree'],
    ['What is an AND gate?', 'andWhat'],
    ['how many rows in a truth table for 3 inputs', 'truthTableHow'],
    ['Why is NAND called a universal gate?', 'universal'],
    ['what does the dot in A · B mean', 'andDot'],
    ['how do I get more coins', 'coins'],
  ])('matches "%s" to %s', (question, id) => {
    expect(idOf(question)).toBe(id);
  });

  it('gives no instant answer to questions it does not know', () => {
    expect(findFaqAnswer('Can you explain flip-flops and memory?', 'en')).toBeNull();
    expect(findFaqAnswer('What is the capital of France?', 'en')).toBeNull();
  });

  it('does not mistake everyday "and" / "or" for gate names', () => {
    expect(findFaqAnswer('Can a gate have 3 or more inputs and still work?', 'en')).toBeNull();
  });

  it('answers in the language asked for', () => {
    expect(findFaqAnswer('What is XOR?', 'ms')).toMatch(/berbeza/i);
  });

  it('every entry has both languages and a unique id', () => {
    const ids = new Set(FAQ.map((entry) => entry.id));
    expect(ids.size).toBe(FAQ.length);
    for (const entry of FAQ) {
      expect(entry.answer.en.length).toBeGreaterThan(40);
      expect(entry.answer.ms.length).toBeGreaterThan(40);
    }
  });

  it('turns logic symbols into words', () => {
    expect(tokenize('1+1 = 1? A · B')).toEqual(['oneplusone', '1', 'dot', 'b']);
  });

  it('finds related notes for questions it cannot answer fully', () => {
    const related = relatedFaqAnswers('Can a NOR gate replace an AND gate in real chips?', 'en');
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(2);
  });
});
