import {
    convexAuthNextjsMiddleware,
    createRouteMatcher,
    nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const convexAuthProxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
    if (!isProtectedRoute(request) || await convexAuth.isAuthenticated()) {
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
