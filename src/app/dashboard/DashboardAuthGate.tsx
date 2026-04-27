'use client';

import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { DashboardShell } from '@/components/dashboard';

export function DashboardAuthGate() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    window.location.replace('/login?next=/dashboard');
  }, [isAuthenticated, isLoading]);

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
