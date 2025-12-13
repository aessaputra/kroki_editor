/**
 * Next.js Proxy - JWT Validation for AI Routes
 * 
 * Protects all /api/ai/* routes with JWT token validation.
 * Uses jose library for Edge Runtime compatibility.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Validate JWT token from HttpOnly cookie
 */
async function validateToken(token: string): Promise<boolean> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return true;
    } catch {
        return false;
    }
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /api/ai/* routes
    if (!pathname.startsWith('/api/ai')) {
        return NextResponse.next();
    }

    // Get token from HttpOnly cookie
    const token = request.cookies.get('owner_token')?.value;

    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized - No token provided' },
            { status: 401 }
        );
    }

    // Validate JWT
    const isValid = await validateToken(token);
    if (!isValid) {
        return NextResponse.json(
            { error: 'Unauthorized - Invalid or expired token' },
            { status: 401 }
        );
    }

    // Token valid, proceed to API route
    return NextResponse.next();
}

// Configure proxy to run only on AI API routes
export const config = {
    matcher: '/api/ai/:path*',
};
