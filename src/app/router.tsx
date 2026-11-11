import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/Home/HomePage';
import LearnPage from '@/pages/Learn/LearnPage';
import LessonPage from '@/pages/Lesson/LessonPage';
import LevelPage from '@/pages/Level/LevelPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import WorldMapPage from '@/pages/WorldMap/WorldMapPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/worlds', element: <WorldMapPage /> },
  { path: '/level/:levelId', element: <LevelPage /> },
  { path: '/learn', element: <LearnPage /> },
  { path: '/lesson/:world', element: <LessonPage /> },
  { path: '/settings', element: <SettingsPage /> },
]);
