import { getLevelsByWorld } from '@/levels';
import { getLesson, LESSONS, passMark } from '../index';
import { lessonSchema } from '../schema';

describe('lesson files', () => {
  it('has one lesson for each of the 5 worlds', () => {
    expect(LESSONS.map((lesson) => lesson.world)).toEqual([1, 2, 3, 4, 5]);
  });

  it('only has lessons for worlds that have levels', () => {
    for (const lesson of LESSONS) {
      expect(getLevelsByWorld(lesson.world).length).toBeGreaterThan(0);
    }
  });

  it.each(LESSONS)('world $world has at least 3 quiz questions', (lesson) => {
    expect(lesson.quiz.length).toBeGreaterThanOrEqual(3);
  });

  it('finds a lesson by world', () => {
    expect(getLesson(2)?.world).toBe(2);
    expect(getLesson(9)).toBeUndefined();
  });
});

describe('passMark', () => {
  it('needs two out of every three answers', () => {
    expect(passMark(getLesson(1)!)).toBe(2);
  });
});

describe('lessonSchema', () => {
  const valid = getLesson(1)!;

  it('rejects an answer that points to a missing option', () => {
    const broken = structuredClone(valid);
    broken.quiz[0].answer = 9;
    expect(lessonSchema.safeParse(broken).success).toBe(false);
  });

  it('rejects text without a Bahasa Melayu translation', () => {
    const broken = structuredClone(valid) as unknown as { steps: { title: { ms?: string } }[] };
    delete broken.steps[0].title.ms;
    expect(lessonSchema.safeParse(broken).success).toBe(false);
  });
});
