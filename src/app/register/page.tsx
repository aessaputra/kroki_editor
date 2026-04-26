import { Suspense } from 'react';
import { PasswordAuthPage } from '@/components/auth/PasswordAuthPage';

export default function RegisterPage() {
    return (
        <Suspense fallback={<main className="flex h-full items-center justify-center bg-surface-alt text-sm text-text-secondary" role="status">Loading registration…</main>}>
            <PasswordAuthPage initialFlow="signUp" defaultReturnTo="/dashboard" />
        </Suspense>
    );
}
