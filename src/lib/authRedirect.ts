const CONTROL_CHAR_OR_BACKSLASH_RE = /[\u0000-\u001f\u007f\\]/;
const AUTH_LOOP_PATHS = new Set(['/login', '/register']);

export function getSafeAuthReturnTo(nextValue: string | null, fallback = '/dashboard'): string {
    const next = nextValue?.trim();

    if (!next) {
        return fallback;
    }

    if (!next.startsWith('/') || next.startsWith('//')) {
        return fallback;
    }

    if (CONTROL_CHAR_OR_BACKSLASH_RE.test(next)) {
        return fallback;
    }

    try {
        const parsed = new URL(next, 'https://example.invalid');

        if (parsed.origin !== 'https://example.invalid') {
            return fallback;
        }

        if (AUTH_LOOP_PATHS.has(parsed.pathname)) {
            return fallback;
        }

        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return fallback;
    }
}
