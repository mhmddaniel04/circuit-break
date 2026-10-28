import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/Home/HomePage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  // { path: '/worlds', element: <WorldMapPage /> },       // Phase 4
  // { path: '/level/:levelId', element: <LevelPage /> },  // Phase 3
]);