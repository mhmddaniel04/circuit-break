import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useProgressStore } from '@/features/progress';
import { getLesson } from '@/lessons';
import LessonPage from '../LessonPage';

const lesson = getLesson(1)!;

function renderLesson(world = '1') {
  const router = createMemoryRouter(
    [
      { path: '/lesson/:world', element: <LessonPage /> },
      { path: '/level/:levelId', element: <p>Level page</p> },
      { path: '/worlds', element: <p>World map</p> },
    ],
    { initialEntries: [`/lesson/${world}`] },
  );
  render(<RouterProvider router={router} />);
}

/** Clicks "Next" through every reading step to reach the quick check. */
function readAllSteps() {
  for (let i = 0; i < lesson.steps.length; i += 1) {
    fireEvent.click(screen.getByRole('button', { name: /next|start the quick check/i }));
  }
}

function answer(optionIndexes: number[]) {
  optionIndexes.forEach((option, i) => {
    fireEvent.click(screen.getByRole('button', { name: lesson.quiz[i].options[option].en }));
    fireEvent.click(screen.getByRole('button', { name: /next question|see my result/i }));
  });
}

const rightAnswers = () => lesson.quiz.map((question) => question.answer);
const wrongAnswer = (i: number) => (lesson.quiz[i].answer === 0 ? 1 : 0);

describe('LessonPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {}, lessons: {} });
  });

  it('shows the lesson one step at a time', () => {
    renderLesson();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Signal Basics');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(lesson.steps[0].title.en);
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(lesson.steps[1].title.en);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('includes a live circuit to try', () => {
    renderLesson();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('group', { name: /NOT gate circuit/i })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /input A/i })).toBeInTheDocument();
  });

  it('unlocks the world after passing the quick check', () => {
    renderLesson();
    readAllSteps();
    expect(screen.getByText(/get at least 2 right/i)).toBeInTheDocument();

    answer(rightAnswers());
    expect(screen.getByText(/lesson complete/i)).toBeInTheDocument();
    expect(useProgressStore.getState().lessons[1]).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: /play the first level/i }));
    expect(screen.getByText('Level page')).toBeInTheDocument();
  });

  it('explains each answer, right or wrong', () => {
    renderLesson();
    readAllSteps();
    fireEvent.click(
      screen.getByRole('button', { name: lesson.quiz[0].options[wrongAnswer(0)].en }),
    );
    expect(screen.getByText(/not quite/i)).toBeInTheDocument();
    expect(screen.getByText(lesson.quiz[0].explain.en)).toBeInTheDocument();
  });

  it('asks the student to try again below the pass mark', () => {
    renderLesson();
    readAllSteps();
    answer(lesson.quiz.map((_, i) => wrongAnswer(i)));
    expect(screen.getByText(/almost there/i)).toBeInTheDocument();
    expect(useProgressStore.getState().lessons[1]).toBeUndefined();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(screen.getByText(/question 1 of 3/i)).toBeInTheDocument();
  });

  it('can go back to the start of the lesson after failing', () => {
    renderLesson();
    readAllSteps();
    answer(lesson.quiz.map((_, i) => wrongAnswer(i)));
    fireEvent.click(screen.getByRole('button', { name: /read the lesson again/i }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(lesson.steps[0].title.en);
  });

  it('shows a message for an unknown lesson', () => {
    renderLesson('9');
    expect(screen.getByText(/this lesson does not exist/i)).toBeInTheDocument();
  });
});
