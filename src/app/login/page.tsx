'use client';

import { useMemo, useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthFlow = 'signIn' | 'signUp';

function getSafeReturnTo(nextValue: string | null): string {
    const next = nextValue?.trim() || '/';

    if (!/^\/(?!\/)/.test(next)) {
        return '/';
    }

    try {
        const resolved = new URL(next, window.location.origin);
        return resolved.origin === window.location.origin ? `${resolved.pathname}${resolved.search}${resolved.hash}` : '/';
    } catch {
        return '/';
    }
}

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signIn, signOut } = useAuthActions();
    const [flow, setFlow] = useState<AuthFlow>('signIn');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const returnTo = useMemo(() => {
        return getSafeReturnTo(searchParams.get('next'));
    }, [searchParams]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.currentTarget);
            formData.set('flow', flow);
            await signIn('password', formData);
            router.push(returnTo);
        } catch (authError) {
            setError(authError instanceof Error ? authError.message : 'Unable to continue. Check your email and password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    return (
        <main className="h-full overflow-auto bg-gray-50 dark:bg-gray-950 px-4 py-8">
            <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                    <span aria-hidden="true">←</span>
                    Back to editor
                </Link>

                <section className="card-elevated p-6 sm:p-8" aria-labelledby="login-heading">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-lg font-bold text-accent">
                            K
                        </div>
                        <p className="badge-accent mb-3">Local MVP account</p>
                        <h1 id="login-heading" className="text-2xl font-bold text-text-primary">
                            {flow === 'signIn' ? 'Login to save diagrams' : 'Create an account'}
                        </h1>
                        <p className="mt-2 text-sm text-text-secondary">
                            Guests can keep editing. Login when you want saved diagrams tied to your account.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8" role="status">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent" />
                            <span className="sr-only">Checking account state</span>
                        </div>
                    ) : isAuthenticated ? (
                        <div className="space-y-4 text-center" data-testid="authenticated-account-state">
                            <div className="rounded-lg bg-surface-alt px-4 py-3 text-sm font-medium text-text-primary">
                                You are signed in and can continue.
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link href={returnTo} className="btn-primary flex-1">
                                    {returnTo === '/' ? 'Open editor' : returnTo === '/dashboard' ? 'Continue to dashboard' : 'Continue'}
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="btn-secondary flex-1"
                                    data-testid="logout-button"
                                >
                                    Log out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit} data-testid="email-password-auth-form">
                            <input type="hidden" name="flow" value={flow} />

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-text-primary">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input"
                                    placeholder="you@example.com"
                                    data-testid="email-input"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-medium text-text-primary">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
                                    required
                                    className="input"
                                    placeholder="Enter your password"
                                    data-testid="password-input"
                                />
                            </div>

                            {error && (
                                <p className="rounded-lg bg-danger-muted px-3 py-2 text-sm font-medium text-danger" role="alert">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                                data-testid="auth-submit-button"
                            >
                                {isSubmitting ? 'Working...' : flow === 'signIn' ? 'Login' : 'Sign up'}
                            </button>

                            <button
                                type="button"
                                className="btn-ghost w-full"
                                onClick={() => {
                                    setError(null);
                                    setFlow(flow === 'signIn' ? 'signUp' : 'signIn');
                                }}
                                data-testid="auth-flow-toggle"
                            >
                                {flow === 'signIn' ? 'Need an account? Sign up' : 'Have an account? Login'}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}
