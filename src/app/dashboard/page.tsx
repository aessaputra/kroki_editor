'use client';

import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard';

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
      <main className="flex min-h-full items-center justify-center bg-surface-alt text-sm text-text-secondary" data-testid="dashboard-loading-state">
        Checking dashboard access…
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-full items-center justify-center bg-surface-alt text-sm text-text-secondary" data-testid="dashboard-redirect-state">
        Redirecting to login…
      </main>
    );
  }

  return <DashboardShell />;
}
