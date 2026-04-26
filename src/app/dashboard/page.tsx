import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard';

export default async function DashboardPage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect('/login?next=/dashboard');
  }

  return <DashboardShell />;
}
