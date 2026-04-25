'use client';

import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login?next=/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-full items-center justify-center bg-gray-50 dark:bg-gray-950 text-sm text-gray-500 dark:text-gray-400" data-testid="dashboard-loading-state">
        Checking dashboard access…
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-full items-center justify-center bg-gray-50 dark:bg-gray-950 text-sm text-gray-500 dark:text-gray-400" data-testid="dashboard-redirect-state">
        Redirecting to login…
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-3 bg-gray-50 dark:bg-gray-950 p-6" data-testid="dashboard-page-root">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Dashboard shell placeholder. Protected data will be added in the next task.
      </p>
    </main>
  );
}
