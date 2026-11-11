import { RouterProvider } from 'react-router';
import { RewardToasts } from '@/features/rewards';
import { router } from './router';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <RewardToasts />
    </>
  );
}
