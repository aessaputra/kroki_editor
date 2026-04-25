import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function readEnvFileValue(name: string): string | undefined {
    const envPath = join(process.cwd(), '.env.local');
    if (!existsSync(envPath)) return undefined;

    const line = readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .find((entry) => entry.startsWith(`${name}=`));
    if (!line) return undefined;

    return line.slice(name.length + 1).replace(/^['"]|['"]$/g, '').trim() || undefined;
}

export function getLocalConvexUrl(): string {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? readEnvFileValue('NEXT_PUBLIC_CONVEX_URL');
    if (!convexUrl) {
        throw new Error('Local Convex prerequisite missing: set NEXT_PUBLIC_CONVEX_URL in the environment or .env.local before running npm run test:e2e.');
    }
    if (!convexUrl.startsWith('http://127.0.0.1:') && !convexUrl.startsWith('http://localhost:')) {
        throw new Error(`Local Convex prerequisite missing: expected NEXT_PUBLIC_CONVEX_URL to point at local Convex, received ${convexUrl}.`);
    }

    return convexUrl;
}

export async function requireLocalConvex(): Promise<void> {
    const convexUrl = getLocalConvexUrl();
    try {
        await fetch(convexUrl, { method: 'GET' });
    } catch (error) {
        throw new Error(`Local Convex prerequisite missing: ${convexUrl} is not reachable. Start local Convex with CONVEX_AGENT_MODE=anonymous npx convex dev, then rerun npm run test:e2e. Original error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
