/**
 * useOwnerAuth Hook
 * 
 * Manages owner authentication state.
 * Checks if current user is authenticated owner.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface OwnerAuthState {
    /** Whether the user is authenticated as owner */
    isOwner: boolean;
    /** Whether we're still checking auth status */
    isLoading: boolean;
    /** Login with secret key */
    login: (secretKey: string) => Promise<boolean>;
    /** Logout */
    logout: () => Promise<void>;
    /** Refresh auth status */
    checkAuth: () => Promise<void>;
}

/**
 * Hook for managing owner authentication
 */
export function useOwnerAuth(): OwnerAuthState {
    const [isOwner, setIsOwner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check current authentication status
     */
    const checkAuth = useCallback(async () => {
        try {
            // Try to call a protected endpoint to check if authenticated
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: '', diagramType: 'test' }),
            });

            // If we get 401, not authenticated
            // If we get 400 (missing params), we ARE authenticated
            setIsOwner(response.status !== 401);
        } catch {
            setIsOwner(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Login with secret key
     */
    const login = useCallback(async (secretKey: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secretKey }),
            });

            if (response.ok) {
                setIsOwner(true);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }, []);

    /**
     * Logout - clear the token
     */
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/owner', { method: 'DELETE' });
            setIsOwner(false);
        } catch {
            console.error('Logout failed');
        }
    }, []);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return {
        isOwner,
        isLoading,
        login,
        logout,
        checkAuth,
    };
}
