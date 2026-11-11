import { createBrowserRouter } from 'react-router';
import AchievementsPage from '@/pages/Achievements/AchievementsPage';
import CheatSheetPage from '@/pages/CheatSheet/CheatSheetPage';
import CityMapPage from '@/pages/CityMap/CityMapPage';
import HomePage from '@/pages/Home/HomePage';
import LearnPage from '@/pages/Learn/LearnPage';
import LessonPage from '@/pages/Lesson/LessonPage';
import LevelPage from '@/pages/Level/LevelPage';
import PracticePage from '@/pages/Practice/PracticePage';
import SettingsPage from '@/pages/Settings/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/worlds', element: <CityMapPage /> },
  { path: '/level/:levelId', element: <LevelPage /> },
  { path: '/learn', element: <LearnPage /> },
  { path: '/lesson/:world', element: <LessonPage /> },
  { path: '/cheatsheet', element: <CheatSheetPage /> },
  { path: '/practice', element: <PracticePage /> },
  { path: '/achievements', element: <AchievementsPage /> },
  { path: '/settings', element: <SettingsPage /> },
]);
