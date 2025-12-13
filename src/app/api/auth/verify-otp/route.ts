/**
 * OTP Verification API Route - Step 2: Verify OTP
 * 
 * POST /api/auth/verify-otp
 * Verifies OTP and issues JWT token.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { SignJWT } from 'jose';

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hash OTP with timestamp for verification
 */
function hashOTP(otp: string, timestamp: number): string {
    const data = `${otp}:${timestamp}:${process.env.JWT_SECRET}`;
    return createHash('sha256').update(data).digest('hex');
}

/**
 * Generate JWT token for owner
 */
async function generateToken(): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    return new SignJWT({ role: 'owner', iat: Date.now() })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .setIssuedAt()
        .sign(secret);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { otp } = body;

        if (!otp) {
            return NextResponse.json(
                { error: 'OTP is required' },
                { status: 400 }
            );
        }

        // Get pending OTP from cookie
        const cookieStore = await cookies();
        const pendingOTP = cookieStore.get('pending_otp')?.value;

        if (!pendingOTP) {
            return NextResponse.json(
                { error: 'No pending OTP. Please request a new one.' },
                { status: 400 }
            );
        }

        // Parse stored hash and timestamp
        const [storedHash, timestampStr] = pendingOTP.split(':');
        const timestamp = parseInt(timestampStr, 10);

        // Check expiry
        if (Date.now() - timestamp > OTP_EXPIRY_MS) {
            return NextResponse.json(
                { error: 'OTP has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Verify OTP
        const providedHash = hashOTP(otp, timestamp);
        if (providedHash !== storedHash) {
            return NextResponse.json(
                { error: 'Invalid OTP' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = await generateToken();

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'Authentication successful',
        });

        // Set JWT cookie
        response.cookies.set('owner_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        // Clear pending OTP cookie
        response.cookies.set('pending_otp', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}
