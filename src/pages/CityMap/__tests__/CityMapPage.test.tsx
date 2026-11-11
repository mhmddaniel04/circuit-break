import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import '@/i18n';
import { useProgressStore } from '@/features/progress';
import { getLevelsByWorld, LEVELS } from '@/levels';
import CityMapPage from '../CityMapPage';

function renderMap() {
  const router = createMemoryRouter([{ path: '/worlds', element: <CityMapPage /> }], {
    initialEntries: ['/worlds'],
  });
  render(<RouterProvider router={router} />);
}

const done = { stars: 2 as const, bestScore: 900, bestSeconds: 20 };
const finishWorld = (world: number) =>
  Object.fromEntries(getLevelsByWorld(world).map((level) => [level.id, done]));

const panel = () => screen.getByRole('complementary');

describe('CityMapPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.setState({ levels: {}, lessons: {} });
  });

  it('shows a button for each of the 5 districts', () => {
    renderMap();
    expect(screen.getByRole('heading', { name: 'Power Grid City' })).toBeInTheDocument();
    const map = screen.getByRole('region', { name: /map of power grid city/i });
    expect(within(map).getAllByRole('button')).toHaveLength(5);
  });

  it('asks a new player to start with the District 1 lesson', () => {
    renderMap();
    expect(within(panel()).getByRole('heading', { name: 'Signal Basics' })).toBeInTheDocument();
    expect(within(panel()).getByRole('link', { name: /start the lesson/i })).toHaveAttribute(
      'href',
      '/lesson/1',
    );
    expect(within(panel()).queryByRole('link', { name: /flip the switch/i })).toBeNull();
  });

  it('opens the first level once the lesson is passed', () => {
    useProgressStore.getState().completeLesson(1);
    renderMap();
    expect(within(panel()).getByRole('link', { name: /flip the switch/i })).toHaveAttribute(
      'href',
      '/level/w1-l1',
    );
    expect(within(panel()).getByRole('link', { name: /lesson complete/i })).toBeInTheDocument();
  });

  it('shows another district when its button is pressed', () => {
    renderMap();
    fireEvent.click(screen.getByRole('button', { name: /AND Factory/ }));
    expect(screen.getByRole('button', { name: /AND Factory/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(panel()).getByRole('heading', { name: 'AND Factory' })).toBeInTheDocument();
  });

  it('starts on the first district that still needs work, and counts powered districts', () => {
    useProgressStore.setState({ levels: { ...finishWorld(1), ...finishWorld(2) } });
    renderMap();
    expect(within(panel()).getByRole('heading', { name: 'OR Station' })).toBeInTheDocument();
    expect(screen.getByText('2 of 5 districts powered')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Signal Basics/ })).toHaveTextContent(/powered/i);
    const stars = 2 * (getLevelsByWorld(1).length + getLevelsByWorld(2).length);
    expect(screen.getByText(`★ ${stars} / ${LEVELS.length * 3}`)).toBeInTheDocument();
  });
});
