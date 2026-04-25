'use client';

import Link from 'next/link';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex-none border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6"
      data-testid="dashboard-header"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="btn-icon lg:hidden"
            aria-label="Open dashboard navigation"
            aria-controls="dashboard-sidebar-panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0">
            <p className="badge-accent mb-1">Diagram dashboard</p>
            <h1 className="truncate text-xl font-bold text-text-primary sm:text-2xl">
              Saved diagram workspace
            </h1>
            <p className="hidden text-sm text-text-secondary sm:block">
              Review saved diagrams and jump back to the editor when you are ready to create.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="btn-primary flex-none px-3 text-xs sm:px-4 sm:text-sm"
          data-testid="dashboard-open-editor-link"
          aria-label="Open editor"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="hidden sm:inline">Open editor</span>
          <span className="sm:hidden">Editor</span>
        </Link>
      </div>
    </header>
  );
}
