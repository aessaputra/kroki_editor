# UI UX Auth Routes Polish

## TL;DR
> **Summary**: Fix auth routing so successful login/signup lands on `/dashboard`, add a dedicated `/register` signup route, remove save-oriented CTAs from the editor, and replace unauthenticated My Diagrams access with a Register CTA. Keep UI polish focused on affected auth/editor/sidebar states only.
> **Deliverables**:
> - Dedicated `/register` App Router entry point for signup-first auth.
> - Safe redirect helper with `/dashboard` default and open-redirect protections.
> - Updated unauthenticated editor/header/sidebar CTAs with no visible `Save` or `Login to save` controls.
> - Focused auth/header/sidebar UI polish using existing design tokens and accessible interactions.
> - Updated Vitest/Playwright coverage for redirect and CTA behavior.
> **Effort**: Medium
> **Parallel**: YES - 2 implementation waves + final verification wave
> **Critical Path**: Task 1 → Task 2 → Tasks 3-5 → Final Verification

## Context
### Original Request
User requested a new plan to polish UI/UX and fix route errors: when on the login page and logging in with an account, the app must navigate to `/dashboard`. User also requested removing `Save` / `Login to save` buttons and changing `My Diagrams` to `Register` for unauthenticated users, with Register navigating to a register page. User explicitly requested `/frontend-design`, `/ui-ux-pro-max`, `/nextjs-app-router-patterns`, and relevant skills.

### Interview Summary
- Register CTA destination: create dedicated `/register` route.
- UI polish scope: focused polish for affected auth, header/editor CTA, and unauthenticated sidebar states only.
- Test strategy: tests-after, using existing Vitest and Playwright infrastructure.

### Metis Review (gaps addressed)
- Defaulted register success redirect to `/dashboard` for consistency with login.
- Safe `next` redirect must allow only internal relative paths and reject external/protocol-relative URLs and `/login`/`/register` loops.
- Preserve authenticated My Diagrams behavior while replacing only logged-out My Diagrams CTA with Register.
- Remove visible Save/Login-to-save CTAs without changing Convex schema, auth provider, or saved-diagram backend behavior.
- Include desktop and mobile CTA verification because `HomePageClient.tsx` has separate desktop/mobile controls.
- Keep polish bounded; no global navigation redesign, dashboard IA changes, new auth provider, autosave, onboarding, or toast-system work.

## Work Objectives
### Core Objective
Make auth entry points and editor CTAs match the desired product flow: login/register routes lead to dashboard, logged-out users are encouraged to register, and save-oriented buttons are no longer visible in the editor UI.

### Deliverables
- `src/lib/authRedirect.ts` shared helper for safe auth redirects.
- Updated `src/app/login/page.tsx` preserving signin-first behavior and defaulting successful signin to `/dashboard`.
- New `src/app/register/page.tsx` signup-first route.
- Shared client auth component at `src/components/auth/PasswordAuthPage.tsx`.
- Updated `src/components/HomePageClient.tsx` CTA branches for authenticated/loading/unauthenticated states.
- Updated `src/components/DiagramHistory.tsx` unauthenticated and empty-state copy.
- Updated/added tests in `tests/unit/` and `tests/e2e/`.
- Playwright dev-server URL alignment to `http://127.0.0.1:43017`, matching `npm run dev`.

### Definition of Done (verifiable conditions with commands)
- `npm run lint` exits `0`.
- `npm run type-check` exits `0`.
- `npm run test` exits `0`.
- `npm run build` exits `0`.
- `npm run test:e2e` exits `0`, or targeted specs documented if full suite is blocked by environment.
- Playwright verifies `/login` default signin, `/register` default signup, successful auth redirect to `/dashboard`, no logged-out Save/Login-to-save CTAs, Register CTA navigation, and authenticated My Diagrams behavior.

### Must Have
- `/login` renders signin mode by default.
- `/register` renders signup mode by default.
- Successful signin from `/login` redirects to `/dashboard` by default.
- Successful signup from `/register` redirects to `/dashboard` by default.
- Safe internal `next` values such as `/dashboard` are respected.
- Unsafe `next` values such as `https://evil.example` and `//evil.example` are rejected.
- Editor UI has no visible `Save` button for any auth state, and logged-out UI has no `Login to save` link/text.
- Logged-out My Diagrams entry point becomes `Register` and navigates to `/register`.
- Authenticated users still have My Diagrams access and dashboard/logout access.
- Desktop and mobile CTA variants are covered.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Do not add middleware unless a task explicitly proves page-level protection cannot satisfy the requirement.
- Do not change Convex schema, auth provider, or saved-diagram backend behavior.
- Do not create autosave, onboarding, a new auth provider, or a broad dashboard/editor redesign.
- Do not use external redirects from `next`.
- Do not show `Register` during auth loading flicker if the app can keep a neutral loading state.
- Do not rely on vague visual acceptance such as “looks better”; all checks must be command/test/verifiable.
- Do not use emoji as structural icons; keep existing SVG/icon style consistent.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after with Vitest + Playwright.
- QA policy: Every task has agent-executed scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Task 1 auth redirect helper; Task 5 visual polish audit can start from existing components but must not finalize snapshots until Task 2/3 land.
Wave 2: Task 2 register/login auth route refactor; Task 3 editor CTA replacement/removal; Task 4 sidebar prompt/copy cleanup.
Wave 3: Final Verification Wave after all implementation tasks.

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1. Safe auth redirect helper | None | 2 |
| 2. Login/register route refactor | 1 | 3, 5 |
| 3. Editor header CTA update | 2 | 4, 5 |
| 4. Diagram sidebar unauth copy cleanup | 3 | 5 |
| 5. Focused UI polish and responsive QA | 2, 3, 4 | Final Verification |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Tasks | Categories |
|---|---:|---|
| 1 | 2 | quick, visual-engineering |
| 2 | 3 | visual-engineering, quick |
| 3 | 4 review agents | oracle, unspecified-high, deep |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add safe auth redirect helper and unit coverage

  **What to do**: Create `src/lib/authRedirect.ts` exporting `getSafeAuthReturnTo(nextValue: string | null, fallback = '/dashboard')`. It must return `fallback` when `nextValue` is empty, external, protocol-relative, malformed, or a redirect loop target (`/login`, `/register`, including query/hash variants). It must preserve safe relative paths with query/hash, e.g. `/dashboard?tab=recent#top`. Add Vitest coverage in `tests/unit/authRedirect.test.ts` for default, safe internal, external URL, protocol-relative URL, login/register loop, whitespace, and malformed cases. Update `src/app/login/page.tsx` later tasks to import this helper rather than keeping window-dependent redirect logic.
  **Must NOT do**: Do not reference `window` inside the helper. Do not allow absolute URLs. Do not make the helper auth-provider-specific.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: small pure utility plus deterministic unit tests.
  - Skills: [`nextjs-app-router-patterns`, `vercel-react-best-practices`] - ensure route safety and avoid client-only coupling in reusable logic.
  - Omitted: [`frontend-design`, `ui-ux-pro-max`] - no visual work in this task.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: [2] | Blocked By: []

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/app/login/page.tsx:11-24` - existing `getSafeReturnTo` logic to replace; current fallback is `/` and uses `window.location.origin`.
  - Pattern: `src/app/login/page.tsx:34-48` - login currently reads `next` and pushes `returnTo` after `signIn`.
  - Test: `tests/unit/dashboardFormat.test.ts` - representative Vitest unit style.
  - Test config: `vitest.config.ts` - jsdom/unit test setup.
  - Script: `package.json:11` - `npm run test` runs Vitest.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `tests/unit/authRedirect.test.ts` exists and covers at least: `null`, `''`, `/dashboard`, `/dashboard?view=recent#top`, `https://evil.example`, `//evil.example`, `/login`, `/login?next=/dashboard`, `/register`, `/register?next=/dashboard`.
  - [ ] `npm run test -- tests/unit/authRedirect.test.ts` exits `0`.
  - [ ] `npm run type-check` exits `0` after helper creation.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Safe internal redirect is preserved
    Tool: Bash
    Steps: Run `npm run test -- tests/unit/authRedirect.test.ts`.
    Expected: Test named for `/dashboard?view=recent#top` passes and returns exactly `/dashboard?view=recent#top`.
    Evidence: .sisyphus/evidence/task-1-auth-redirect-unit.txt

  Scenario: Unsafe redirect falls back to dashboard
    Tool: Bash
    Steps: Run `npm run test -- tests/unit/authRedirect.test.ts`.
    Expected: Tests for `https://evil.example`, `//evil.example`, `/login`, and `/register` all return `/dashboard`.
    Evidence: .sisyphus/evidence/task-1-auth-redirect-unsafe.txt
  ```

  **Commit**: NO | Message: `fix(auth): add safe dashboard redirects` | Files: [`src/lib/authRedirect.ts`, `tests/unit/authRedirect.test.ts`]

- [x] 2. Refactor auth pages and add dedicated `/register`

  **What to do**: Extract the client auth UI from `src/app/login/page.tsx` into `src/components/auth/PasswordAuthPage.tsx`, with props `initialFlow: 'signIn' | 'signUp'` and `defaultReturnTo?: string`. Update `src/app/login/page.tsx` so it renders signin-first mode and defaults return to `/dashboard`. Add `src/app/register/page.tsx` rendering signup-first mode and default return `/dashboard`. Keep links between pages: `/login` must include a clear Register link to `/register`; `/register` must include a clear Login link to `/login`. Use `getSafeAuthReturnTo(searchParams.get('next'), '/dashboard')`. Preserve existing `data-testid` values for auth form fields/buttons where possible so existing Playwright tests remain easy to update. After successful signin/signup, call `router.push(returnTo)` and ensure `/login` no longer defaults to `/`.
  **Must NOT do**: Do not add a new auth provider. Do not modify Convex schema/auth backend. Do not add middleware. Do not duplicate large auth form code across two pages if a shared component avoids drift.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: combines route behavior with auth form UI polish and accessibility.
  - Skills: [`nextjs-app-router-patterns`, `frontend-design`, `ui-ux-pro-max`, `vercel-react-best-practices`] - App Router route structure, polished auth card, accessible form states, minimal client component scope.
  - Omitted: [`convex-setup-auth`] - auth provider is already configured; task must not reconfigure Convex Auth.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [3, 5] | Blocked By: [1]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/app/login/page.tsx:1-177` - current signin/signup combined client page to extract/refactor.
  - Pattern: `src/app/login/page.tsx:71-83` - current auth card heading/copy; update text so login is not framed as “Login to save diagrams”.
  - Pattern: `src/app/login/page.tsx:151-170` - submit and flow toggle buttons; replace toggle-only UX with route links where appropriate.
  - Auth provider: `src/app/layout.tsx:34-40` - app is wrapped by `ConvexAuthNextjsServerProvider`; do not move this.
  - Auth provider: `src/app/ConvexClientProvider.tsx:15-19` - client auth provider already exists; do not duplicate it.
  - Dashboard protection: `src/app/dashboard/page.tsx:12-17` - unauthenticated dashboard already redirects to `/login?next=/dashboard`.
  - Test: `tests/e2e/dashboard.spec.ts:45-54` - dashboard unauth redirect currently expects `/login?next=/dashboard`.
  - Test: `tests/e2e/mvp-smoke.spec.ts:33-41` and `tests/e2e/dashboard.spec.ts:13-22` - signup currently uses `/login` then toggles signup and expects `/`; update to `/register` and `/dashboard`.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Visiting `/login` shows signin form by default with submit label `Login` and a Register link to `/register`.
  - [ ] Visiting `/register` shows signup form by default with submit label `Sign up` and a Login link to `/login`.
  - [ ] Successful signin from `/login` redirects to `/dashboard` by default.
  - [ ] Successful signup from `/register` redirects to `/dashboard` by default.
  - [ ] `/login?next=/dashboard` still redirects to `/dashboard` after successful signin.
  - [ ] `/login?next=https://evil.example` redirects to `/dashboard`, never off-origin.
  - [ ] `npm run type-check` and `npm run lint` exit `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Login succeeds to dashboard
    Tool: Playwright
    Steps: Start app with local Convex preflight; create or reuse E2E account; go to `/login`; fill `email-input` and `password-input`; click `auth-submit-button`.
    Expected: URL pathname becomes `/dashboard`; `dashboard-shell` is visible.
    Evidence: .sisyphus/evidence/task-2-login-dashboard.png

  Scenario: Register page starts in signup mode and blocks unsafe next
    Tool: Playwright
    Steps: Go to `/register?next=https://evil.example`; verify submit button reads `Sign up`; fill unique E2E credentials; submit.
    Expected: URL origin remains local app origin and pathname becomes `/dashboard`; no external navigation occurs.
    Evidence: .sisyphus/evidence/task-2-register-safe-next.png
  ```

  **Commit**: NO | Message: `fix(auth): add register route and dashboard redirects` | Files: [`src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/components/auth/PasswordAuthPage.tsx`, `tests/e2e/*.spec.ts`]

- [x] 3. Remove editor Save/Login-to-save CTAs and replace logged-out My Diagrams with Register

  **What to do**: Update `src/components/HomePageClient.tsx` header/control rendering so no auth state shows the visible manual `Save` button, and logged-out users do not see `Login to save` or `My Diagrams`. In the logged-out state, render a single primary Register link to `/register` with accessible name exactly `Register` and a stable test id such as `register-navigation-link`. During auth loading, keep a neutral loading badge/state rather than flashing Register. For authenticated users, preserve existing Dashboard, Log out, and My Diagrams access while keeping Save absent. For desktop, replace the current Save/Login/My Diagrams control area; for mobile, replace the `leftAction` My Diagrams icon with Register behavior or hide it until authenticated. Remove or refactor now-unused local save-only state/handlers/import destructures only if TypeScript/lint require it; do not delete `useSavedDiagrams` or backend save functions globally.
  **Must NOT do**: Do not show any visible button/link/text named `Save` in any editor auth state. Do not show `Login to save` in logged-out UI. Do not remove authenticated My Diagrams access. Do not add autosave or new save UX.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: responsive header/action UI and interaction polish.
  - Skills: [`frontend-design`, `ui-ux-pro-max`, `nextjs-app-router-patterns`, `vercel-react-best-practices`] - CTA hierarchy, accessible responsive states, App Router links, avoid re-render/client regressions.
  - Omitted: [`convex-setup-auth`] - no auth backend changes.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [4, 5] | Blocked By: [2]

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/components/HomePageClient.tsx:76-79` - current auth loading/authenticated state and router hooks.
  - Pattern: `src/components/HomePageClient.tsx:157-188` - manual save handler currently routes unauthenticated users to `/login`; remove/refactor if no visible Save CTA uses it.
  - Change target: `src/components/HomePageClient.tsx:308-316` - current visible `Save` button to remove.
  - Change target: `src/components/HomePageClient.tsx:342-349` - current unauthenticated `Login to save` link to replace with Register or remove depending final header structure.
  - Change target: `src/components/HomePageClient.tsx:360-372` - desktop My Diagrams button; branch so authenticated users see My Diagrams and logged-out users see Register link.
  - Change target: `src/components/HomePageClient.tsx:388-399` - mobile My Diagrams icon; branch/hide/replace for logged-out users.
  - Test: `tests/e2e/mvp-smoke.spec.ts:13-31` - currently expects Save/Login-to-save and save-click redirect; update to expect absence and Register navigation.
  - Test: `tests/e2e/mvp-smoke.spec.ts:68-71` - currently expects Login-to-save after logout; update to Register CTA.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Logged-out `/` shows no element with accessible name exactly `Save`.
  - [ ] Logged-out `/` shows no text `Login to save`.
  - [ ] Logged-out `/` shows a `Register` link pointing to `/register`.
  - [ ] Clicking logged-out Register navigates to `/register`.
  - [ ] Auth loading state does not briefly render Register or My Diagrams before auth resolves.
  - [ ] Authenticated `/` still shows Dashboard, Log out, and My Diagrams controls, with no visible `Save` button.
  - [ ] Desktop and mobile viewport checks pass.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Logged-out desktop CTA state
    Tool: Playwright
    Steps: New browser context; set viewport 1280x800; go to `/`; query role button/link names and visible text.
    Expected: `page.getByRole('link', { name: /^Register$/ })` is visible and has href `/register`; `page.getByRole('button', { name: /^Save$/ })` count is 0; `page.getByText('Login to save')` count is 0; unauthenticated My Diagrams button is not visible.
    Evidence: .sisyphus/evidence/task-3-logged-out-desktop.png

  Scenario: Authenticated desktop keeps My Diagrams
    Tool: Playwright
    Steps: Sign up via `/register`; wait for `/dashboard`; navigate to `/`; inspect header controls.
    Expected: Dashboard and Log out controls visible; My Diagrams control visible; Register link not visible; Save/Login-to-save absent.
    Evidence: .sisyphus/evidence/task-3-authenticated-desktop.png
  ```

  **Commit**: NO | Message: `fix(editor): replace guest save CTAs with register` | Files: [`src/components/HomePageClient.tsx`, `tests/e2e/mvp-smoke.spec.ts`, `tests/e2e/dashboard.spec.ts`]

- [x] 4. Update My Diagrams sidebar unauthenticated and empty-state copy

  **What to do**: Update `src/components/DiagramHistory.tsx` so the unauthenticated sidebar prompt no longer says `Login to save`. Because Task 3 removes the logged-out public My Diagrams entry point, keep this as a defensive fallback only: title `Create an account to use My Diagrams`, body text explaining guests can keep editing and registered users can manage saved diagrams, and a primary Register link to `/register` with test id `my-diagrams-register-link`. Include a secondary Login link only if needed, but it must not say `Login to save`. Update authenticated empty state copy at `src/components/DiagramHistory.tsx:271-280` so it does not mention “manual Save button” after the Save CTA is removed; use neutral wording such as `No saved diagrams yet` and `Saved diagrams you create will appear here.`
  **Must NOT do**: Do not imply logged-out users can save before registering. Do not remove the authenticated diagram list, rename, load, or delete functionality. Do not change sidebar close/focus behavior.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: sidebar state copy, CTA hierarchy, accessible prompt polish.
  - Skills: [`frontend-design`, `ui-ux-pro-max`] - focused empty/auth state polish with accessible CTA and contrast.
  - Omitted: [`nextjs-app-router-patterns`] - only needed for `Link href="/register"`, no route architecture change here.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [5] | Blocked By: [3]

  **References** (executor has NO interview context - be exhaustive):
  - Change target: `src/components/DiagramHistory.tsx:244-261` - logged-out My Diagrams prompt currently says `Login to see My Diagrams` and link text `Login to save`.
  - Change target: `src/components/DiagramHistory.tsx:271-280` - authenticated empty state currently references the manual Save button.
  - Preserve: `src/components/DiagramHistory.tsx:223-229` - close button/test id/focus target must remain intact.
  - Test: `tests/e2e/mvp-smoke.spec.ts:22-26` - currently opens sidebar as logged-out user; update assertions for Register prompt if sidebar remains reachable only through direct component state/test route, otherwise remove logged-out sidebar expectation.

  **Acceptance Criteria** (agent-executable only):
  - [ ] No `Login to save` string remains in `src/components/DiagramHistory.tsx`.
  - [ ] Static inspection confirms the fallback unauthenticated sidebar prompt has a Register CTA to `/register` and no save promise.
  - [ ] Authenticated empty state no longer references a manual Save button.
  - [ ] Sidebar close button keeps `data-testid="my-diagrams-close-button"` and accessible label.
  - [ ] `npm run lint` and `npm run type-check` exit `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Fallback unauthenticated sidebar prompt is register-focused
    Tool: Bash
    Steps: Run a static content check over `src/components/DiagramHistory.tsx` for `Login to save`, `my-diagrams-register-link`, and `href="/register"`.
    Expected: `Login to save` is absent; `my-diagrams-register-link` and `href="/register"` are present; copy does not promise guest saving.
    Evidence: .sisyphus/evidence/task-4-sidebar-static.txt

  Scenario: Authenticated empty sidebar copy avoids removed Save CTA
    Tool: Playwright
    Steps: Create fresh account via `/register`; navigate to `/`; open My Diagrams.
    Expected: Empty state is visible, does not contain `manual Save button`, and does not contain `Login to save`.
    Evidence: .sisyphus/evidence/task-4-sidebar-empty-auth.png
  ```

  **Commit**: NO | Message: `fix(sidebar): update my diagrams auth prompts` | Files: [`src/components/DiagramHistory.tsx`, `tests/e2e/*.spec.ts`]

- [x] 5. Apply focused UI polish and update route/CTA E2E coverage

  **What to do**: Polish only the affected auth pages, editor header controls, Register CTA, and sidebar prompt states. Use existing `btn-primary`, `btn-secondary`, `btn-ghost`, `input`, `card-elevated`, `badge`, and theme token classes where possible. Auth pages should have clear titles: `/login` = account login / dashboard access; `/register` = create account / dashboard access. CTAs should have one primary action per state: Login form submit, Register form submit, logged-out editor Register link. Ensure labels remain visible, error messages keep `role="alert"`, loading states use `role="status"`, touch targets are at least 44px where practical, and focus rings remain visible. Update Playwright specs so previous expectations for Save/Login-to-save are replaced with the new product behavior; include a mobile viewport scenario for Register CTA and authenticated My Diagrams. Update `playwright.config.ts` so both `baseURL` and `webServer.url` are exactly `http://127.0.0.1:43017`, matching `package.json:6`.
  **Must NOT do**: Do not redesign dashboard content, editor layout, diagram rendering, data table, or global theme. Do not introduce generic purple-gradient AI styling, emojis as icons, or decorative motion that lacks purpose. Do not add brittle screenshot-only tests.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: final visual coherence, responsive behavior, accessibility, and E2E updates.
  - Skills: [`frontend-design`, `ui-ux-pro-max`, `nextjs-app-router-patterns`, `vercel-react-best-practices`, `playwright`] - production UI polish, accessibility, route validation, performance-safe client boundaries, browser QA.
  - Omitted: [`tailwind-design-system`] - no new design system is required; use existing tokens/classes.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [Final Verification] | Blocked By: [2, 3, 4]

  **References** (executor has NO interview context - be exhaustive):
  - UI tokens: `src/app/login/page.tsx:61-83` - existing card/surface/button/token style to preserve and refine after extraction.
  - UI tokens: `src/components/HomePageClient.tsx:291-373` - current header control layout and responsive classes.
  - UI tokens: `src/components/DiagramHistory.tsx:244-280` - prompt/empty-state surfaces to polish.
  - E2E config: `playwright.config.ts:3-19` - Playwright currently starts `npm run dev` and uses Desktop Chrome project.
  - Script: `package.json:6` - `npm run dev` serves `next dev -H 0.0.0.0 -p 43017`; Playwright URL must not remain hardcoded to port `3000`.
  - E2E preflight: `tests/e2e/convexPreflight.ts` - E2E auth flows require local Convex reachability.
  - E2E tests: `tests/e2e/mvp-smoke.spec.ts:13-71` - update smoke expectations for guest/auth states.
  - E2E tests: `tests/e2e/dashboard.spec.ts:13-22`, `tests/e2e/dashboard.spec.ts:45-60`, `tests/e2e/dashboard.spec.ts:87-95` - update helper and dashboard redirect expectations after `/register` and dashboard default redirect changes.
  - Scripts: `package.json:9-13` - lint/type/test/e2e commands.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Login/register forms retain visible labels for email/password and role-alert error feedback.
  - [ ] Auth pages expose reciprocal navigation links: `/login` → Register and `/register` → Login.
  - [ ] Logged-out desktop and mobile home/editor states show Register and no Save/Login-to-save.
  - [ ] Authenticated desktop and mobile states show My Diagrams access and no Register CTA.
  - [ ] Updated Playwright specs use role/name queries for new Register/Login CTAs where stable; use existing test ids only for established app controls.
  - [ ] Playwright `baseURL` and `webServer.url` are `http://127.0.0.1:43017`.
  - [ ] `npm run lint`, `npm run type-check`, `npm run test`, and targeted Playwright specs exit `0`.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Mobile guest Register CTA replaces My Diagrams
    Tool: Playwright
    Steps: New browser context; set viewport 390x844; go to `/`; wait for auth loading to settle; inspect top/header and split-pane action area.
    Expected: Register link is visible and navigates to `/register`; `my-diagrams-open-button-mobile` is not visible/clickable while logged out; Save/Login-to-save absent.
    Evidence: .sisyphus/evidence/task-5-mobile-guest-register.png

  Scenario: Full verification command set
    Tool: Bash
    Steps: Run `npm run lint && npm run type-check && npm run test && npm run build`; then run targeted Playwright specs `npx playwright test tests/e2e/mvp-smoke.spec.ts tests/e2e/dashboard.spec.ts` when local Convex preflight is available.
    Expected: All commands exit `0`; if Playwright is blocked by missing local Convex, capture the exact preflight failure and do not claim E2E pass.
    Evidence: .sisyphus/evidence/task-5-verification-commands.txt
  ```

  **Commit**: NO | Message: `test(auth-ui): cover dashboard redirects and register CTAs` | Files: [`src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/components/auth/PasswordAuthPage.tsx`, `src/components/HomePageClient.tsx`, `src/components/DiagramHistory.tsx`, `tests/e2e/mvp-smoke.spec.ts`, `tests/e2e/dashboard.spec.ts`]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit after all implementation tasks and verification pass, not per task, unless requested otherwise.
- Suggested message: `fix(auth-ui): route login to dashboard and polish guest CTAs`
- Do not commit secrets, `.env.local`, test artifacts, or `.sisyphus/evidence` unless explicitly requested.

## Success Criteria
- User can click Login, authenticate, and land on `/dashboard`.
- User can click Register from logged-out editor UI and land on `/register` with signup mode visible.
- Logged-out editor/history UI no longer shows `Save` or `Login to save`.
- Authenticated user still has dashboard and My Diagrams access.
- Focused UI polish improves clarity/accessibility without broad redesign.
- All listed commands and QA scenarios pass with saved evidence.
