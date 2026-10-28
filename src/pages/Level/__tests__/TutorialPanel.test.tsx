import { fireEvent, render, screen } from '@testing-library/react';
import '@/i18n';
import { TutorialPanel } from '../TutorialPanel';

const steps = [
  { en: 'First step', ms: 'Langkah pertama' },
  { en: 'Second step', ms: 'Langkah kedua' },
];

describe('TutorialPanel', () => {
  it('walks through the steps and closes at the end', () => {
    render(<TutorialPanel steps={steps} />);
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Second step')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /got it/i }));
    expect(screen.queryByText('Second step')).not.toBeInTheDocument();
  });
});
