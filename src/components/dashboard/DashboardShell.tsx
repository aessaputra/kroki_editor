'use client';

import { useState } from 'react';
import { DashboardDiagramTableSection } from './DashboardDiagramTable';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

export function DashboardShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-alt text-text-primary" data-testid="dashboard-shell">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6" data-testid="dashboard-content">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
            <DashboardDiagramTableSection />
          </div>
        </main>
      </div>
    </div>
  );
}
