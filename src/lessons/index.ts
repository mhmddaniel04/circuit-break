import { lessonSchema, type Lesson } from './schema';

export type { Lesson, LessonBlock, LessonStep, QuizQuestion } from './schema';

// Loads every lesson file automatically: data/world1.json, data/world2.json, ...
const files = import.meta.glob<unknown>('./data/*.json', { eager: true, import: 'default' });

export const LESSONS: readonly Lesson[] = Object.entries(files)
  .map(([path, data]) => {
    const parsed = lessonSchema.safeParse(data);
    if (!parsed.success) throw new Error(`Invalid lesson file ${path}: ${parsed.error.message}`);
    return parsed.data;
  })
  .sort((a, b) => a.world - b.world);

export function getLesson(world: number): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.world === world);
}

/** How many quiz answers must be right to pass: two out of every three questions. */
export function passMark(lesson: Lesson): number {
  return Math.ceil((lesson.quiz.length * 2) / 3);
}
