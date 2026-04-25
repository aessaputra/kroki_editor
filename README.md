# Kroki Diagram Editor

A local Next.js editor for creating and previewing Kroki diagrams. Guests can edit and preview diagrams in memory; signed-in users can manually save, list, load, rename, and delete diagrams through Convex-backed storage.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file and fill the local Convex values:

```bash
cp .env.local.example .env.local
```

3. Start Convex and the Next.js app in separate terminals:

```bash
npx convex dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the editor.

## Environment variables

See `.env.local.example` for the local variables used by the app and E2E tests:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `CONVEX_DEPLOYMENT`
- `E2E_TEST_EMAIL`
- `E2E_TEST_PASSWORD`

## Verification

Run the main checks before handing off changes:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```
