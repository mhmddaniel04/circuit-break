import { fireEvent, render, screen, within } from '@testing-library/react';
import '@/i18n';
import type { LessonBlock } from '@/lessons';
import { LessonBlocks } from '../LessonBlocks';

const t = (en: string) => ({ en, ms: en });

function renderBlocks(blocks: LessonBlock[]) {
  render(<LessonBlocks blocks={blocks} lang="en" />);
}

describe('LessonBlocks', () => {
  it('shows story, fact and Bit blocks', () => {
    renderBlocks([
      { type: 'story', icon: '🚗', title: t('Starting a car'), body: t('Key AND brake.') },
      { type: 'fact', body: t('Boole wrote about logic in 1854.') },
      { type: 'bit', body: t('Hi there!') },
    ]);
    expect(screen.getByRole('heading', { name: 'Starting a car' })).toBeInTheDocument();
    expect(screen.getByText(/did you know/i)).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('lights the bulb of a live circuit when the switches give 1', () => {
    renderBlocks([{ type: 'circuit', gate: 'AND' }]);
    expect(screen.getByText('Output = 0')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: /input A/i }));
    expect(screen.getByText('Output = 0')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('switch', { name: /input B/i }), { key: 'Enter' });
    expect(screen.getByText('Output = 1')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /input B/i })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('hides the answer until the student predicts it', () => {
    renderBlocks([{ type: 'predict', gate: 'OR', inputs: [0, 1] }]);
    const block = screen.getByRole('region', { name: /predict first/i });
    expect(within(block).getByText('A = 0, B = 1 go into the OR gate. What will the bulb show?'));
    expect(within(block).getByText('Output = ?')).toBeInTheDocument();

    fireEvent.click(within(block).getByRole('button', { name: '0' }));
    expect(within(block).getByText(/not quite/i)).toBeInTheDocument();
    expect(within(block).getByText(/OR gives 1/)).toBeInTheDocument();
    expect(within(block).getByText('Output = 1')).toBeInTheDocument();
    expect(within(block).getByRole('button', { name: '1' })).toBeDisabled();
  });

  it('checks a filled-in truth table and marks the wrong rows', () => {
    renderBlocks([{ type: 'fillTable', gate: 'NOT' }]);
    const check = screen.getByRole('button', { name: /check my table/i });
    expect(check).toBeDisabled();

    // Row A = 0: tap twice to get 1 (correct). Row A = 1: tap twice to get 1 (wrong).
    const rowA0 = screen.getByRole('button', { name: /output for A = 0/i });
    const rowA1 = screen.getByRole('button', { name: /output for A = 1/i });
    fireEvent.click(rowA0);
    fireEvent.click(rowA0);
    fireEvent.click(rowA1);
    fireEvent.click(rowA1);
    fireEvent.click(check);
    expect(screen.getByText(/1 row is wrong/i)).toBeInTheDocument();

    fireEvent.click(rowA1);
    expect(rowA1).toHaveTextContent('0');
    fireEvent.click(check);
    expect(screen.getByText(/every row is correct/i)).toBeInTheDocument();
  });
});
