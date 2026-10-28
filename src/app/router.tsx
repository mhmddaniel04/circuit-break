import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/Home/HomePage';
import LevelPage from '@/pages/Level/LevelPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/level/:levelId', element: <LevelPage /> },
  // { path: '/worlds', element: <WorldMapPage /> },  // Phase 4
]);
