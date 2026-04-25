import { Suspense } from 'react';
import { HomePageClient } from '@/components/HomePageClient';

export default function HomePage() {
  return (
    <Suspense fallback={<main className="h-full bg-gray-50 dark:bg-gray-950" />}>
      <HomePageClient />
    </Suspense>
  );
}
