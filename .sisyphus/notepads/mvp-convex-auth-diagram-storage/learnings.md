# Learnings

## 2026-04-25 Task: session-start
- Plan path: `.sisyphus/plans/mvp-convex-auth-diagram-storage.md`.
- MVP scope: Convex + Convex Auth email/password, local dev only, guest unsaved-only, authenticated manual save/list/load/delete/rename.
- Convex MCP requirement: use `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor`; default dev deployment only; no production flags.
- Current app starts with browser IndexedDB via `src/hooks/useDiagramStorage.ts`, auto-save via `src/hooks/useAutoSave.ts`, owner auth via `src/hooks/useOwnerAuth.ts` and `src/app/owner/page.tsx`, AI routes/components under `src/app/api/ai/*` and `src/components/AIGenerate*`.

## 2026-04-25 Task: foundation
- `npm run type-check` passed after adding `type-check`, `test`, `test:watch`, and `test:e2e` scripts.
- `npm run test -- --passWithNoTests` passed with Vitest 3.2.4 and no test files present yet.
- `npm install` for `@auth/core@0.37.0` required `--legacy-peer-deps` because the repo still carries `nodemailer@7.0.11`.

## 2026-04-25 Task: foundation-followup
- `.env.local.example` needed a `.gitignore` exception (`!.env.local.example`) so the example file stays trackable while other env files remain ignored.
- Secret scans should explicitly call out empty placeholder variables like `E2E_TEST_PASSWORD=` so they are not mistaken for leaked secrets.

## 2026-04-25 Task: ai-owner-removal
- Removing the AI/owner subsystems left the editor shell intact; the only remaining `jose`/`nodemailer` mentions are transitive in `package-lock.json` via `@auth/core`.
- `npm uninstall lottie-react nodemailer @types/nodemailer jose` successfully rewrote `package-lock.json` and removed the direct runtime dependencies from `package.json`.
- `npm run type-check` and `npm run test -- --passWithNoTests` passed after the cleanup.

## 2026-04-25 Task: auth-provider-ui
- `CONVEX_AGENT_MODE=anonymous npx convex dev --once` successfully created local Convex generated files and `.env.local` for the headless workspace.
- `npx @convex-dev/auth` refused to run because the working tree had uncommitted changes, so the Convex Auth setup was added manually from the docs: `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts`, and `convex/schema.ts`.
- Convex Auth password-only MVP uses `providers: [Password]`; omitting `verify` and `reset` keeps email verification and password reset flows absent.
- Next App Router wiring uses `ConvexAuthNextjsServerProvider` in `layout.tsx` and a client `ConvexAuthNextjsProvider` with `ConvexReactClient` created at module scope.
- Playwright smoke verified guest `/` shows `Login to save`, `/login` shows email/password controls, and `/owner` returns 404 with no forbidden owner/auth terms.

## 2026-04-25 Task: auth-provider-ui
- Next 16 uses `proxy.ts` instead of the older `middleware.ts` convention; `src/proxy.ts` with `convexAuthNextjsMiddleware()` is required for Convex Auth to handle `/api/auth`.
- Without the proxy, Convex Auth client posts to `/api/auth` and receives Next's 404 HTML, producing `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` in the login UI.
- The Next production build prints `ƒ Proxy (Middleware)` when `src/proxy.ts` is detected correctly.
- Manual Convex Auth setup also needs deployment env vars `JWT_PRIVATE_KEY` and `JWKS`; the missing private key caused `/api/auth` to return JSON 400 until local anonymous Convex env vars were set.
- A successful real smoke signs up with a unique email/password, lands on `/`, shows authenticated header/logout, then logout restores the guest `Login to save` CTA.

## 2026-04-25 Task: convex-diagrams
- The diagrams schema should preserve `...authTables` and add `diagrams` beside it; no app-level `users` table is needed for this MVP because `identity.tokenIdentifier` is sufficient ownership state.
- The Convex list-by-owner/newest-first pattern is an index over `['ownerTokenIdentifier', 'updatedAt']` plus `.withIndex(...eq(ownerTokenIdentifier))` and `.order('desc')`.
- `npx convex codegen` successfully regenerated Convex bindings and included the new `diagrams` module in `convex/_generated/api.d.ts`.
- Vitest is installed, but there are still no test files or Convex runtime test harness in the repo; `npm run test -- --passWithNoTests` passes as an empty suite.
- Runtime Convex QA is viable after Playwright browser signup by extracting the Convex Auth JWT from localStorage for `http://127.0.0.1:3210` and passing it to `ConvexHttpClient`.

## 2026-04-25 Task: convex-storage-service
- Replacing browser persistence can keep `useDiagramStorage` as a compatibility adapter, but the real service layer should be `useSavedDiagrams` backed only by Convex queries/mutations.
- Manual save behavior is tracked with an in-memory `currentSavedDiagramId`: no id creates a Convex diagram, and an existing id updates the same diagram.
- Guest save verification works by clicking the manual Save button and confirming navigation to `/login` with zero create/update mutation requests.
- Authenticated browser smoke verified first Save creates one diagram and second Save updates it; the history list stayed at one item.
