import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { createRandom, generateQuestion, solveQuestion } from '@/features/practice';
import PracticePage from '../PracticePage';

// Math.random() = 0.5 makes the page use seed 2^30, so the test knows which question it gets.
const SEED = Math.floor(0.5 * 2 ** 31);

function renderPractice() {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const router = createMemoryRouter([{ path: '/practice', element: <PracticePage /> }], {
    initialEntries: ['/practice'],
  });
  render(<RouterProvider router={router} />);
}

/** Taps every answer cell until it shows the right value (or, with `mistakes`, the wrong one). */
function fillTable(difficulty: 'easy' | 'medium' | 'hard', mistakes = 0) {
  const question = generateQuestion(difficulty, createRandom(SEED));
  const rows = solveQuestion(question);
  let wrongLeft = mistakes;
  rows.forEach((row) => {
    question.columns.forEach((column, c) => {
      const inputs = row.inputs.map((bit, i) => `${question.inputs[i]} = ${bit}`).join(', ');
      const cell = screen.getByRole('button', {
        name: `${column.name} for ${inputs}: not chosen yet`,
      });
      let want = row.outputs[c];
      if (wrongLeft > 0) {
        want = want === 1 ? 0 : 1;
        wrongLeft -= 1;
      }
      fireEvent.click(cell); // ? → 0
      if (want === 1) fireEvent.click(cell); // 0 → 1
    });
  });
}

describe('PracticePage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows a circuit, its expression and an empty truth table', () => {
    renderPractice();
    expect(screen.getByRole('heading', { name: 'SPM Practice' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /logic circuit with inputs A, B/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Y = /)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(5); // header + 4 rows for 2 inputs
    expect(screen.getByRole('button', { name: /check answers/i })).toBeDisabled();
  });

  it('counts a fully correct table as solved', () => {
    renderPractice();
    fillTable('easy');
    fireEvent.click(screen.getByRole('button', { name: /check answers/i }));
    expect(screen.getByText(/all correct/i)).toBeInTheDocument();
    expect(screen.getByText('✓ 1 solved')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /worked answer/i })).toBeInTheDocument();
  });

  it('marks wrong answers in red', () => {
    renderPractice();
    fillTable('easy', 2);
    fireEvent.click(screen.getByRole('button', { name: /check answers/i }));
    expect(screen.getByText(/2 answers are wrong/i)).toBeInTheDocument();
    expect(screen.getByText('✓ 0 solved')).toBeInTheDocument();
  });

  it('can show the worked answer', () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    const worked = screen.getByRole('region', { name: /worked answer/i });
    expect(within(worked).getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/not chosen yet/)).not.toBeInTheDocument();
  });

  it('uses 3 inputs and 8 rows for medium questions', () => {
    renderPractice();
    fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('row')).toHaveLength(9);
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });
});
