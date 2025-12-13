/**
 * Owner Authentication API Route - Step 1: Send OTP
 * 
 * POST /api/auth/owner
 * Validates secret key and sends OTP to owner email.
 */

import { NextResponse } from 'next/server';
import { createHash, randomInt } from 'crypto';
import nodemailer from 'nodemailer';

/**
 * Generate 6-digit OTP
 */
function generateOTP(): string {
    return randomInt(100000, 999999).toString();
}

/**
 * Hash OTP with timestamp for secure storage
 */
function hashOTP(otp: string, timestamp: number): string {
    const data = `${otp}:${timestamp}:${process.env.JWT_SECRET}`;
    return createHash('sha256').update(data).digest('hex');
}

/**
 * Send OTP email via SMTP
 */
async function sendOTPEmail(otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.OWNER_EMAIL,
        subject: 'Kroki Editor - Your OTP Code',
        text: `Your OTP code is: ${otp}\n\nThis code expires in 5 minutes.`,
        html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Kroki Editor</h2>
                <p style="color: #666;">Your verification code is:</p>
                <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
                </div>
                <p style="color: #999; font-size: 14px;">This code expires in 5 minutes.</p>
            </div>
        `,
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { secretKey } = body;

        // Validate secret key
        if (!secretKey || secretKey !== process.env.OWNER_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Invalid secret key' },
                { status: 401 }
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const timestamp = Date.now();
        const otpHash = hashOTP(otp, timestamp);

        // Send OTP email
        await sendOTPEmail(otp);

        // Create response
        const response = NextResponse.json({
            success: true,
            message: 'OTP sent to your email',
            requiresOTP: true,
        });

        // Store hashed OTP in cookie (expires in 5 min)
        response.cookies.set('pending_otp', `${otpHash}:${timestamp}`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 5, // 5 minutes
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/auth/owner - Logout
 */
export async function DELETE() {
    const response = NextResponse.json({
        success: true,
        message: 'Logged out successfully',
    });

    response.cookies.set('owner_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });

    response.cookies.set('pending_otp', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });

    return response;
}
