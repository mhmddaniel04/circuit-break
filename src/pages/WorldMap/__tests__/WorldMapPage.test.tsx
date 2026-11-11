import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useProgressStore } from '@/features/progress';
import { LEVELS } from '@/levels';
import WorldMapPage from '../WorldMapPage';

function renderMap() {
  const router = createMemoryRouter([{ path: '/worlds', element: <WorldMapPage /> }], {
    initialEntries: ['/worlds'],
  });
  render(<RouterProvider router={router} />);
}

const [first, second] = LEVELS;

describe('WorldMapPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {}, lessons: {} });
  });

  it('asks a new player to start with the World 1 lesson', () => {
    renderMap();
    expect(screen.getAllByRole('link', { name: /start the lesson/i })[0]).toHaveAttribute(
      'href',
      '/lesson/1',
    );
    expect(screen.queryByRole('link', { name: new RegExp(first.title.en, 'i') })).toBeNull();
    expect(screen.getAllByText(/finish the lesson to unlock/i)).toHaveLength(5);
  });

  it('opens the first level once the lesson is passed, and locks the rest', () => {
    useProgressStore.getState().completeLesson(1);
    renderMap();
    expect(screen.getByRole('link', { name: /lesson complete/i })).toHaveAttribute(
      'href',
      '/lesson/1',
    );
    expect(screen.getByRole('link', { name: new RegExp(first.title.en, 'i') })).toHaveAttribute(
      'href',
      `/level/${first.id}`,
    );
    expect(screen.queryByRole('link', { name: new RegExp(second.title.en, 'i') })).toBeNull();
    expect(screen.getByText(second.title.en)).toBeInTheDocument();
  });

  it('unlocks the next level and shows stars after a level is completed', () => {
    useProgressStore.getState().recordResult(first.id, { stars: 2, score: 900, seconds: 20 });
    renderMap();
    expect(
      screen.getByRole('link', { name: new RegExp(second.title.en, 'i') }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /2 of 3 stars/i })).toBeInTheDocument();
    expect(screen.getByText(`★ 2 / ${LEVELS.length * 3}`)).toBeInTheDocument();
  });

  it('shows all five worlds', () => {
    renderMap();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5);
  });
});
