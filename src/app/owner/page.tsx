/**
 * Owner Login Page - 2FA with Email OTP
 * 
 * Step 1: Enter secret key → OTP sent
 * Step 2: Enter OTP → JWT issued
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';
import toast from 'react-hot-toast';

type Step = 'secret' | 'otp';

function OwnerLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isOwner, logout, checkAuth } = useOwnerAuth();
    const [step, setStep] = useState<Step>('secret');
    const [secretKey, setSecretKey] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Auto-login with URL key parameter
    useEffect(() => {
        const key = searchParams.get('key');
        if (key) {
            handleSecretKeySubmit(key);
        } else {
            setShowForm(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Step 1: Submit secret key → sends OTP email
    const handleSecretKeySubmit = async (key: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secretKey: key }),
            });

            const data = await response.json();

            if (response.ok && data.requiresOTP) {
                toast.success('OTP sent! Check your email 📧');
                setStep('otp');
            } else {
                toast.error(data.error || 'Invalid secret key');
                setShowForm(true);
            }
        } catch {
            toast.error('Something went wrong');
            setShowForm(true);
        }
        setIsLoading(false);
    };

    // Step 2: Verify OTP → issues JWT
    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: otp.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Welcome! 🎉');
                await checkAuth();
                router.push('/');
            } else {
                toast.error(data.error || 'Invalid OTP');
            }
        } catch {
            toast.error('Verification failed');
        }
        setIsLoading(false);
    };

    const handleSecretSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!secretKey.trim()) return;
        handleSecretKeySubmit(secretKey);
    };

    // Already logged in
    if (isOwner) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="text-center">
                    <div className="text-green-500 text-6xl mb-4">✓</div>
                    <p className="text-gray-600 mb-6">AI features enabled</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-white border border-gray-900 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Go to Editor
                        </button>
                        <button
                            onClick={() => { logout(); toast.success('Logged out'); router.push('/'); }}
                            className="px-6 py-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading
    if (!showForm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
            </div>
        );
    }

    // Step 2: OTP Input
    if (step === 'otp') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <form onSubmit={handleOTPSubmit} className="w-full max-w-xs">
                    <h1 className="text-xl font-medium text-gray-900 text-center mb-2">Enter OTP</h1>
                    <p className="text-gray-500 text-sm text-center mb-8">Check your email for the code</p>

                    <div className="relative bg-white mb-6">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            id="otp"
                            name="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            disabled={isLoading}
                            autoFocus
                            className="peer bg-transparent h-14 w-full rounded-lg text-gray-900 text-center text-2xl tracking-[0.5em] placeholder-transparent ring-2 px-3 ring-gray-300 focus:ring-gray-900 focus:outline-none transition-all"
                            placeholder="000000"
                        />
                        <label
                            htmlFor="otp"
                            className="absolute cursor-text left-2 -top-2.5 text-sm text-gray-500 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-gray-900 peer-focus:text-sm transition-all"
                        >
                            6-digit code
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={otp.length !== 6 || isLoading}
                        className="w-full h-12 bg-white border border-gray-900 text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                        ) : (
                            'Verify'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setStep('secret'); setOtp(''); }}
                        className="w-full mt-4 text-sm text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        ← Back
                    </button>
                </form>
            </div>
        );
    }

    // Step 1: Secret Key Input
    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <form onSubmit={handleSecretSubmit} className="w-full max-w-xs">
                <h1 className="text-xl font-medium text-gray-900 text-center mb-8">Owner Access</h1>

                <div className="relative bg-white mb-6">
                    <input
                        type="password"
                        id="secretKey"
                        name="secretKey"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        disabled={isLoading}
                        className="peer bg-transparent h-12 w-full rounded-lg text-gray-900 placeholder-transparent ring-2 px-3 ring-gray-300 focus:ring-gray-900 focus:outline-none transition-all"
                        placeholder="Secret Key"
                    />
                    <label
                        htmlFor="secretKey"
                        className="absolute cursor-text left-2 -top-2.5 text-sm text-gray-500 bg-white px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-gray-900 peer-focus:text-sm transition-all"
                    >
                        Secret Key
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={!secretKey.trim() || isLoading}
                    className="w-full h-12 bg-white border border-gray-900 text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                    ) : (
                        'Continue'
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="w-full mt-4 text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                    ← Back
                </button>
            </form>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
        </div>
    );
}

export default function OwnerPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <OwnerLoginContent />
        </Suspense>
    );
}
