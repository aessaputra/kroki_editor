'use client';

import Link from 'next/link';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    label: 'Editor',
    href: '/',
    description: 'Create and preview diagrams',
    current: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
    ),
  },
  {
    label: 'Diagrams',
    href: '/dashboard',
    description: 'Dashboard overview',
    current: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2m14 0V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4" />
    ),
  },
];

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-label="Close dashboard navigation overlay"
        />
      ) : null}

      <aside
        id="dashboard-sidebar-panel"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface shadow-xl transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Dashboard navigation"
        data-testid="dashboard-sidebar"
      >
        <div className="flex h-16 flex-none items-center justify-between border-b border-border px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent-muted text-base font-bold text-accent">
              K
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-text-primary">Kroki Editor</span>
              <span className="block truncate text-xs text-text-secondary">Diagram control room</span>
            </span>
          </div>

          <button type="button" className="btn-icon lg:hidden" onClick={onClose} aria-label="Close dashboard navigation">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Primary dashboard navigation">
          <ul className="space-y-2" role="list">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={item.current ? 'page' : undefined}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring ${
                    item.current
                      ? 'border-accent bg-accent-muted text-accent shadow-sm'
                      : 'border-transparent text-text-secondary hover:border-border hover:bg-hover hover:text-text-primary'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${
                      item.current ? 'bg-surface text-accent' : 'bg-surface-alt text-text-muted group-hover:text-text-primary'
                    }`}
                    aria-hidden="true"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{item.label}</span>
                    <span className="block truncate text-xs opacity-80">{item.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
