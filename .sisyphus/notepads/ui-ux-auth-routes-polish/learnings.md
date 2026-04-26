# Learnings

## 2026-04-25 Task: context-gathering-next-auth-redirects
- Next/App Router redirect helpers must never pass raw `next` values into `router.push`; validate first.
- Safe redirect pattern: accept only values starting with a single `/`; reject absolute URLs, protocol-relative URLs (`//evil.example`), control characters, and backslashes.
- Keep route validation pure and independent from browser globals so it can be unit tested.
- Server/client boundary best practice is to keep interactive auth form as client component and keep reusable redirect sanitization outside the component.

## 2026-04-25 Task: context-gathering-test-impact
- `playwright.config.ts` currently hardcodes `http://127.0.0.1:3000` but `npm run dev` serves port `43017`; Task 5 must align Playwright config.
- E2E specs affected: `tests/e2e/mvp-smoke.spec.ts` and `tests/e2e/dashboard.spec.ts`.
- Existing E2E depends on `manual-save-button`, `login-to-save-link`, `my-diagrams-open-button`, `auth-flow-toggle`, and dashboard redirect `/login?next=/dashboard`.
- `tests/unit/useSavedDiagrams.test.ts` only couples to the auth guard message `Login required to save diagrams`; avoid changing unless necessary.

## 2026-04-25 Task: context-gathering-playwright-auth-ui
- Playwright `webServer.url` and `use.baseURL` should match exactly; this repo should use `http://127.0.0.1:43017` after Task 5.
- Prefer `getByLabel` for email/password fields and `getByRole('button'|'link', { name })` for auth/register CTAs; keep existing test ids only for established app controls.
- After submitting auth forms, use `page.waitForURL('**/dashboard')` or `expect(page).toHaveURL('/dashboard')` after navigation settles.
- For absent CTAs, prefer explicit absence checks such as `toHaveCount(0)` when the element should not exist, or visibility checks when it remains mounted but hidden.
- Desktop/mobile coverage can be done via projects or per-test `page.setViewportSize`; plan uses targeted per-scenario viewport checks.

## 2026-04-25 Task: context-gathering-auth-ui-impact
- `src/lib/authRedirect.ts`, `src/app/register/page.tsx`, and `src/components/auth/PasswordAuthPage.tsx` do not exist yet.
- `src/app/login/page.tsx:11-24` contains inline `getSafeReturnTo` fallbacking to `/` and using `window.location.origin`; Task 1 must replace this with a pure helper.
- `src/app/login/page.tsx:47` pushes `returnTo` after `signIn`; Task 2 must default successful auth to `/dashboard`.
- `src/components/HomePageClient.tsx:308-316` is the visible Save button; removing it affects E2E tests and may make `handleSaveDiagram` unreachable from UI.
- `src/components/HomePageClient.tsx:342-349` is logged-out `Login to save`; replace with Register link.
- `src/components/HomePageClient.tsx:361-372` and `388-399` are desktop/mobile My Diagrams controls; branch by auth state.
- `src/components/DiagramHistory.tsx:244-261` is unauthenticated sidebar prompt; replace Login-to-save with Register fallback.
- `src/components/DiagramHistory.tsx:271-280` authenticated empty state mentions the manual Save button; update copy.
- `src/app/dashboard/page.tsx:16` redirect to `/login?next=/dashboard` should stay valid.

## 2026-04-25 Task: auth-redirect-helper-implementation
- `getSafeAuthReturnTo(nextValue, fallback = '/dashboard')` should stay pure and only accept same-app paths that start with exactly one `/`.
- `new URL(next, 'https://example.invalid')` works well for preserving pathname, search, and hash without relying on browser globals.
- Rejecting `/login` and `/register` by pathname cleanly blocks redirect loops while still allowing safe routes like `/dashboard?view=recent#top`.
- A small table-driven Vitest file is enough to cover null, empty, whitespace, absolute URL, protocol-relative, backslash, and control-character cases.

## 2026-04-25 Task: auth-route-refactor-dedicated-register
- Keep App Router auth route files server-side and minimal; wrap the shared client auth component in `Suspense` because `useSearchParams()` lives inside the client component.
- `PasswordAuthPage` should remain the single owner of `useRouter`, `useSearchParams`, Convex Auth hooks, form state, and submit/signout handlers.
- Use route-level entry points instead of an in-form flow toggle: `/login` passes `initialFlow="signIn"`, `/register` passes `initialFlow="signUp"`, and reciprocal links use direct `/register` and `/login` hrefs.
- Successful password signup and signin should push the sanitized `getSafeAuthReturnTo(searchParams.get('next'), '/dashboard')` value so default, unsafe, and safe internal redirects share one path.
- Targeted Playwright auth-route QA can be run with a temporary config pointed at `http://127.0.0.1:43017`, but the Convex preflight requires a local `NEXT_PUBLIC_CONVEX_URL`; the current environment points at the remote deployment.

## 2026-04-25 Task: editor-register-cta-removal
- `HomePageClient` should keep `auth-loading-state` as the first auth branch; render guest `register-navigation-link` only after Convex auth loading resolves false.
- Removing the visible editor Save button also removes the only E2E-accessible save seed path, so dashboard E2E should not depend on `manual-save-button` until a non-visible test seed strategy exists.
- Logged-out My Diagrams access needs both visible controls and keyboard shortcuts gated; otherwise Ctrl/Cmd+H can still open the guest sidebar even when buttons are hidden.
- React lint flags synchronous state resets inside effects in modified files; deferring reset/status updates through `queueMicrotask` satisfies `react-hooks/set-state-in-effect` while preserving behavior.
- Playwright command QA can fail before tests when `playwright.config.ts` waits on `127.0.0.1:3000` while `npm run dev` binds `43017`; direct MCP browser QA in this environment is additionally blocked by missing Chrome at `/opt/google/chrome/chrome`.

## 2026-04-25 Task: sidebar-register-fallback-copy
- `DiagramHistory` unauthenticated sidebar is now only a defensive fallback after the public guest entry point was removed; keep the copy Register-focused and avoid saying guests can save.
- The fallback Register CTA should use `href="/register"` and `data-testid="my-diagrams-register-link"`; do not revive `my-diagrams-login-link` or `Login to save`.
- Authenticated sidebar empty-state copy should stay generic about saved diagrams appearing in the account because the old visible manual Save button has been removed from the editor UI.

## 2026-04-25 Task: focused-ui-polish-route-cta-e2e
- Auth route copy now distinguishes account login from account creation while keeping both flows dashboard-oriented; `/login` exposes a Register link and `/register` exposes a Login link.
- Keep auth inputs and affected editor/header CTAs at practical 44px touch targets by extending existing `input`, `btn-primary`, `btn-secondary`, and `btn-ghost` utilities rather than adding new abstractions.
- `playwright.config.ts` must keep both `use.baseURL` and `webServer.url` at `http://127.0.0.1:43017` to match the repository `npm run dev` script.
- Targeted route/CTA E2E coverage can use role queries for Register/Login form/navigation controls and existing test ids for established editor/sidebar controls and absence checks.
- The editor header auth loading badge keeps `data-testid="auth-loading-state"` and visible text `Checking account...`, and must expose `role="status"` like other Task 5 loading states.

## 2026-04-25 Task: final-verification-wave
- F1-F4 reviewers all returned `VERDICT: APPROVE`; Playwright/browser limitations were classified as environment blockers, not application defects.
- Future commits should include only plan-scoped source/test/config files and exclude unrelated dirty/generated artifacts unless the user explicitly approves them.

## 2026-04-26 Task: convex-auth-invalid-secret-debug
- In the installed `@convex-dev/auth` source, `InvalidSecret` is returned by `retrieveAccountWithCredentialsImpl` when the Password provider's secret verification returns false; it usually means wrong password for an existing account, not a route redirect bug.
- Production Convex env initially did not list `JWT_PRIVATE_KEY` or `JWKS`; both were generated as a matched pair and set on the production deployment with output redacted.
- `CONVEX_SITE_URL` is a built-in Convex environment variable and cannot be overridden via `npx convex env set`; local examples should still include it for clarity when tooling reads `.env.local`.
- Client auth UI should map low-level `InvalidSecret`, `InvalidAccountId`, and `TooManyFailedAttempts` messages to user-friendly form errors while preserving `role="alert"`.

## 2026-04-26 Task: post-login-dashboard-navigation
- `@convex-dev/auth` documents that password `signIn()` can resolve before the client-server handshake fully settles, so the auth page waits for `useConvexAuth().isAuthenticated` before navigating to `/dashboard`.
- Next 16 uses `src/proxy.ts` for the Convex Auth middleware/proxy integration; protecting `/dashboard(.*)` there avoids a client-only auth race after login.
- `nextjsMiddlewareRedirect(request, '/login')` does not add a `next` parameter, so the proxy patches the returned `Location` header to preserve `next=<original path and query>`.

## 2026-04-26 Task: authenticated-editor-my-diagrams-visibility
- Authenticated editor state should show a labeled `My Diagrams` button directly in the header across viewport sizes; icon-only mobile access was too ambiguous after login.
- Logged-out editor state must still show Register and keep My Diagrams controls absent.
- Logout belongs in the dashboard header, not the editor header; the authenticated editor header should prioritize Dashboard and My Diagrams.
