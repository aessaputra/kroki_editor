import { isAuthenticatedNextjs } from '@convex-dev/auth/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardAuthGate } from './DashboardAuthGate';

function canUseServerAuthCookies(host: string, protocol: string): boolean {
  return protocol === 'https' || /^(localhost|127\.0\.0\.1):\d+$/.test(host);
}

export default async function DashboardPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'http';

  if (canUseServerAuthCookies(host, protocol) && !(await isAuthenticatedNextjs())) {
    redirect('/login?next=/dashboard');
  }

  return <DashboardAuthGate />;
}
