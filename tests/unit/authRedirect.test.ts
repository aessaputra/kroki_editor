import { describe, expect, it } from 'vitest';
import { getSafeAuthReturnTo } from '@/lib/authRedirect';

describe('getSafeAuthReturnTo', () => {
    it('returns the fallback for empty or unsafe inputs', () => {
        expect(getSafeAuthReturnTo(null)).toBe('/dashboard');
        expect(getSafeAuthReturnTo('')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('   ')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('https://evil.example')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('//evil.example')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/login')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/login?next=/dashboard')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/register')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/register?next=/dashboard')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/dashboard\\path')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/dashboard\u0000')).toBe('/dashboard');
    });

    it('preserves safe same-app return paths', () => {
        expect(getSafeAuthReturnTo('/dashboard')).toBe('/dashboard');
        expect(getSafeAuthReturnTo('/dashboard?view=recent#top')).toBe('/dashboard?view=recent#top');
    });
});
