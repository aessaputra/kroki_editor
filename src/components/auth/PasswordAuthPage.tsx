'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';
import { useConvexAuth } from 'convex/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSafeAuthReturnTo } from '@/lib/authRedirect';

type AuthFlow = 'signIn' | 'signUp';

interface PasswordAuthPageProps {
    initialFlow: AuthFlow;
    defaultReturnTo?: string;
}

const authContent = {
    signIn: {
        badge: 'Account login',
        heading: 'Login to your diagram dashboard',
        description: 'Login to access your dashboard, manage saved diagrams, and continue editing with your account.',
        submitLabel: 'Login',
        alternatePrompt: 'New to Kroki?',
        alternateHref: '/register',
        alternateLabel: 'Register',
        passwordAutoComplete: 'current-password',
    },
    signUp: {
        badge: 'Create account',
        heading: 'Create your diagram dashboard account',
        description: 'Register for dashboard access so saved diagrams stay connected to your account across sessions.',
        submitLabel: 'Register',
        alternatePrompt: 'Already have an account?',
        alternateHref: '/login',
        alternateLabel: 'Login',
        passwordAutoComplete: 'new-password',
    },
} as const;

function getAuthErrorMessage(authError: unknown): string {
    const message = authError instanceof Error ? authError.message : String(authError);

    if (message.includes('InvalidSecret') || message.includes('InvalidAccountId')) {
        return 'Email or password is incorrect. Check your credentials or register a new account.';
    }

    if (message.includes('TooManyFailedAttempts')) {
        return 'Too many failed login attempts. Please wait a moment, then try again.';
    }

    return authError instanceof Error ? authError.message : 'Unable to continue. Check your email and password.';
}

export function PasswordAuthPage({ initialFlow, defaultReturnTo = '/dashboard' }: PasswordAuthPageProps) {
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signIn } = useAuthActions();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingReturnTo, setPendingReturnTo] = useState<string | null>(null);
    const content = authContent[initialFlow];
    const returnTo = useMemo(() => {
        return getSafeAuthReturnTo(searchParams.get('next'), defaultReturnTo);
    }, [defaultReturnTo, searchParams]);
    const returnToRef = useRef(returnTo);

    useEffect(() => {
        returnToRef.current = returnTo;
    }, [returnTo]);

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        window.location.replace(pendingReturnTo ?? returnToRef.current);
    }, [isAuthenticated, isLoading, pendingReturnTo]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.currentTarget);
            formData.set('flow', initialFlow);
            const result = await signIn('password', formData);

            if (result.redirect) {
                window.location.assign(result.redirect.toString());
                return;
            }

            if (result.signingIn) {
                setPendingReturnTo(returnTo);
                return;
            }

            setError('Sign in needs one more step before opening your dashboard. Please try again.');
        } catch (authError) {
            setPendingReturnTo(null);
            setError(getAuthErrorMessage(authError));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoading && isAuthenticated) {
        return <main className="h-full bg-surface-alt" aria-hidden="true" />;
    }

    return (
        <main className="h-full overflow-auto bg-surface-alt px-4 py-8 text-text-primary">
            <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center">
                <Link
                    href="/"
                    className="mb-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                >
                    <span aria-hidden="true">←</span>
                    Back to editor
                </Link>

                <section className="card-elevated p-6 sm:p-8" aria-labelledby="auth-heading">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-lg font-bold text-accent">
                            K
                        </div>
                        <p className="badge-accent mb-3">{content.badge}</p>
                        <h1 id="auth-heading" className="text-2xl font-bold text-text-primary">
                            {content.heading}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                            {content.description}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8" role="status">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent" />
                            <span className="sr-only">Checking account state</span>
                        </div>
                    ) : (
                        <form className="space-y-4" onSubmit={handleSubmit} data-testid="email-password-auth-form">
                            <input type="hidden" name="flow" value={initialFlow} />

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
                                    className="input min-h-[44px]"
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
                                    autoComplete={content.passwordAutoComplete}
                                    required
                                    className="input min-h-[44px]"
                                    placeholder="Enter your password"
                                    data-testid="password-input"
                                />
                            </div>

                            {error ? (
                                <p className="rounded-lg bg-danger-muted px-3 py-2 text-sm font-medium text-danger" role="alert">
                                    {error}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isSubmitting || pendingReturnTo !== null}
                                className="btn-primary min-h-[44px] w-full disabled:cursor-not-allowed disabled:opacity-60"
                                data-testid="auth-submit-button"
                            >
                                {pendingReturnTo ? 'Working...' : isSubmitting ? 'Working...' : content.submitLabel}
                            </button>

                            <p className="text-center text-sm text-text-secondary">
                                {content.alternatePrompt}{' '}
                                <Link href={content.alternateHref} className="rounded font-semibold text-accent transition-colors hover:text-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring">
                                    {content.alternateLabel}
                                </Link>
                            </p>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}
