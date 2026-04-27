import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

function canUseServerAuthCookies(request: NextRequest): boolean {
    const host = request.headers.get('host') ?? '';
    const protocol = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');

    return protocol === 'https' || /^(localhost|127\.0\.0\.1):\d+$/.test(host);
}

const convexAuthProxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
    if (!isProtectedRoute(request) || !canUseServerAuthCookies(request) || await convexAuth.isAuthenticated()) {
        return;
    }

    const response = nextjsMiddlewareRedirect(request, '/login');
    const location = response.headers.get('Location');
    if (location) {
        const redirectUrl = new URL(location);
        redirectUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
        response.headers.set('Location', redirectUrl.toString());
    }

    return response;
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
    return convexAuthProxy(request, event);
}

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
