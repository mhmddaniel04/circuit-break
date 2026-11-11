import { createBrowserRouter } from 'react-router';
import CheatSheetPage from '@/pages/CheatSheet/CheatSheetPage';
import HomePage from '@/pages/Home/HomePage';
import LearnPage from '@/pages/Learn/LearnPage';
import LessonPage from '@/pages/Lesson/LessonPage';
import LevelPage from '@/pages/Level/LevelPage';
import PracticePage from '@/pages/Practice/PracticePage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import WorldMapPage from '@/pages/WorldMap/WorldMapPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/worlds', element: <WorldMapPage /> },
  { path: '/level/:levelId', element: <LevelPage /> },
  { path: '/learn', element: <LearnPage /> },
  { path: '/lesson/:world', element: <LessonPage /> },
  { path: '/cheatsheet', element: <CheatSheetPage /> },
  { path: '/practice', element: <PracticePage /> },
  { path: '/settings', element: <SettingsPage /> },
]);
