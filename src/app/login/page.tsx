import { Suspense } from 'react';
import { PasswordAuthPage } from '@/components/auth/PasswordAuthPage';

export default function LoginPage() {
    return (
        <Suspense fallback={<main className="flex h-full items-center justify-center bg-surface-alt text-sm text-text-secondary" role="status">Loading login…</main>}>
            <PasswordAuthPage initialFlow="signIn" defaultReturnTo="/dashboard" />
        </Suspense>
    );
}
