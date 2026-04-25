'use client';

import { useState } from 'react';
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
            <section className="card-elevated overflow-hidden" aria-labelledby="dashboard-overview-title">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
                <div className="p-5 sm:p-6 lg:p-8">
                  <p className="badge-accent mb-4">Protected dashboard</p>
                  <h2 id="dashboard-overview-title" className="text-2xl font-bold text-text-primary sm:text-3xl">
                    Your saved diagrams will live here.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                    This shell establishes the authenticated diagram workspace: persistent navigation, a sticky dashboard header, and responsive content regions ready for the saved-diagram list in the next task.
                  </p>
                </div>

                <div className="border-t border-border bg-surface-alt p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
                    <p className="text-sm font-semibold text-text-primary">Workspace status</p>
                    <div className="mt-4 space-y-3 text-sm text-text-secondary">
                      <div className="flex items-center justify-between gap-3">
                        <span>Navigation</span>
                        <span className="badge-accent">Editor + Diagrams</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Access</span>
                        <span className="badge">Signed in</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>Next section</span>
                        <span className="badge">Diagram list</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3" aria-label="Dashboard foundation areas">
              <div className="card p-5 lg:col-span-2">
                <h3 className="text-lg font-semibold text-text-primary">Diagram dashboard foundation</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  The content panel intentionally stays lightweight for this task. Diagram table state, preview details, edits, and delete flows remain reserved for the follow-up dashboard tasks.
                </p>
              </div>

              <div className="card p-5">
                <h3 className="text-lg font-semibold text-text-primary">Quick route</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Use the header action or sidebar link to return to the editor without adding dead dashboard links.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
