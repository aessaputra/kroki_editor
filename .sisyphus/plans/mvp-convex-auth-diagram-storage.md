# MVP Convex Auth Diagram Storage Refactor

## TL;DR
> **Summary**: Replace browser-only IndexedDB diagram persistence and single-owner OTP/JWT auth with a local MVP using Convex + Convex Auth email/password, while removing AnythingLLM AI features completely. Guests keep the editor/preview experience but cannot persist diagrams; authenticated users can manually save/list/load/delete/rename only their own diagrams.
> **Deliverables**:
> - Convex local setup wiring and Convex Auth email/password integration.
> - Convex MCP server connection configured for this project directory.
> - Private user-owned saved diagram model and Convex queries/mutations.
> - UI refactor for guest vs authenticated user states, manual save, and “My Diagrams”.
> - Clean removal of idb-keyval persistence, AnythingLLM AI routes/UI, and nodemailer+jose owner auth.
> - Minimal verification stack: `type-check`, Vitest, Playwright smoke tests.
> **Effort**: Large
> **Parallel**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 5 → Task 7 → Final Verification

## Context
### Original Request
User wants an MVP plan to refactor this project so it no longer uses:
- `idb-keyval` for browser/IndexedDB local diagram storage.
- AnythingLLM API for AI generate/fix/revise diagram features.
- `nodemailer` + `jose` owner OTP/JWT-cookie auth.

User wants guest and registered/logged-in users. Guests can create/edit/preview diagrams but cannot save. Registered/logged-in users can save diagrams they created and view/manage their own saved diagrams.

### Interview Summary
- Backend/auth: **Convex + Convex Auth**.
- Login/signup method: **email/password**.
- Deployment target: **local-development MVP only**, not production-ready deployment.
- Convex tooling: **use Convex MCP server** connected to this project directory: `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor`.
- AI: **remove cleanly**, no replacement provider in MVP.
- Guest: **unsaved-only**, no server guest sessions and no local persistence fallback.
- Old IndexedDB data: **no migration/import/export prompt**.
- Saved diagram MVP: **save/list/load/delete/rename**. No pinning, retention cleanup, folders, sharing, collaboration, public links, search, tags, or version history.
- Save semantics: **manual save only**. Do not preserve auto-save. Loading a saved diagram tracks its current saved id; “Save” updates that record; “Save as new” is not in MVP unless implementer needs it to avoid data loss, in which case it must be labeled explicitly and tested.
- Auth UX decision: create a dedicated `/login` route for signup/login and a header auth control. Logout is required in the header/menu for authenticated users.
- Email verification/password reset/magic links/OTP/OAuth: out of MVP.
- Tests: add minimal `type-check`, Vitest, and Playwright smoke coverage.

### Metis Review (gaps addressed)
- Added explicit manual-save semantics; removed auto-save as a feature.
- Added explicit guest behavior: zero persisted storage, including no IndexedDB/localStorage/sessionStorage draft fallback.
- Added exact diagram schema/function responsibilities and ownership guardrails.
- Added explicit cleanup targets for AI routes/UI/envs and owner auth routes/hooks/envs.
- Added local Convex setup handoff: implementer must not automate interactive `npx convex dev` if it blocks.
- Added Convex MCP requirement: use project-directory-scoped MCP for Convex deployment inspection/function execution, dev deployment only.
- Added Playwright smoke requirements for guest, auth, save/list/load/delete/rename, and AI/owner absence.

## Work Objectives
### Core Objective
Implement the smallest local MVP where unauthenticated guests can use the editor without persistence and authenticated registered users can privately manage their own saved diagrams through Convex.

### Deliverables
- Convex backend initialized locally and wired into Next.js App Router.
- Convex MCP server configured/verified for `/home/coder/dev/kroki_editor`.
- Convex Auth email/password configured for local MVP.
- Convex `diagrams` table and authenticated-only functions.
- Frontend auth state, login/signup page, logout, and authenticated save controls.
- Convex-backed diagram list/load/delete/rename UI replacing IndexedDB history.
- Removal of AI and owner auth code paths and unused dependencies.
- Minimal automated verification scripts and tests.

### Definition of Done (verifiable conditions with commands)
- `npm run type-check` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes after Convex local environment variables are present.
- `npm run test:e2e` passes with local Convex dev + Next dev available.
- Convex MCP server can be started for this project with `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor`, and implementation evidence records MCP status/tables/function checks where available.
- Package/source scan confirms `idb-keyval`, `nodemailer`, direct `jose`, and `lottie-react` are absent after cleanup, unless a remaining package is explicitly justified by new non-AI/non-owner code.
- No `src/app/api/ai/*`, `src/app/api/auth/owner`, `src/app/api/auth/verify-otp`, `src/app/owner`, `src/hooks/useOwnerAuth.ts`, or `src/proxy.ts` owner-AI protection remains unless replaced by a documented non-AI/non-owner purpose.
- Guests cannot save via UI and unauthenticated direct Convex function calls fail.
- Authenticated users can save/list/load/delete/rename their own diagrams only.

### Must Have
- Use Convex + Convex Auth, not a custom JWT/email OTP stack.
- Use Convex MCP server for Convex inspection/verification where possible, scoped to this project directory.
- Use email/password auth only for MVP.
- Use Convex server-side identity checks inside every saved-diagram query/mutation.
- Store diagram ownership by authenticated identity, using `identity.tokenIdentifier` as the owner key for MVP.
- Keep editor/preview behavior working for guests.
- Manual save only; no auto-save and no session restore from local storage.
- Add stable selectors/test IDs for Playwright on auth/save/history controls.

### Must NOT Have
- No AnythingLLM replacement provider.
- No AI UI, AI routes, AI env vars, AI middleware/proxy, or dormant AI dead code.
- No `idb-keyval`, IndexedDB, localStorage, or sessionStorage fallback for diagrams.
- No migration/import/export flow for existing local IndexedDB diagrams.
- No `nodemailer`, custom owner OTP, `OWNER_SECRET_KEY`, `OWNER_EMAIL`, `JWT_SECRET` owner-token flow, or `owner_token` cookies.
- No production auth hardening, production redirect setup, production email provider setup, CI pipeline, monitoring, rate-limit/quota system, billing, teams, sharing, collaboration, public galleries, folders, tags, search, pinning, retention cleanup, or version history.
- No Convex MCP production access flags such as `--prod` or `--dangerously-enable-production-deployments`.
- No complex RBAC. Only two UI states: unauthenticated guest and authenticated registered user.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed after local Convex/Next prerequisites are running.
- Test decision: minimal tests with Vitest + Playwright; add `type-check` script.
- QA policy: Every task has agent-executed happy and failure/edge scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`.
- Human prerequisite for local MVP: if Convex CLI setup requires interactive auth/project selection, the implementer must pause and ask user to run `npx convex dev`, then continue after `.env.local`, `convex/`, and generated files exist.
- Convex MCP policy: start/configure MCP with `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor`; use default development deployment only. Do not use `--prod` or `--dangerously-enable-production-deployments`.

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Task 1 foundation setup and Task 4 AI/owner removal inventory + deletion can run after package-change coordination.
Wave 2: Task 2 Convex Auth provider/UI, Task 3 Convex diagram schema/functions.
Wave 3: Task 5 diagram persistence hook/service, Task 6 main UI/history refactor, Task 8 final cleanup and package/env verification.

### Dependency Matrix (full, all tasks)
- Task 1 blocks Tasks 2, 3, 5, 7 and establishes Convex MCP availability for all Convex tasks.
- Task 2 blocks Tasks 5, 6, 7.
- Task 3 blocks Tasks 5, 6, 7.
- Task 4 can run after Task 1 package coordination, and blocks Task 8.
- Task 5 depends on Tasks 2 and 3, and blocks Tasks 6 and 7.
- Task 6 depends on Tasks 2, 3, 5, and blocks Task 7.
- Task 7 depends on Tasks 1, 2, 3, 5, 6.
- Task 8 depends on Tasks 4, 6, 7.

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 2 tasks → quick, quick.
- Wave 2 → 2 tasks → deep, deep.
- Wave 3 → 4 tasks → deep, visual-engineering, quick, unspecified-high.

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Establish Convex/Auth/Test Foundation

  **What to do**: Add the local MVP dependencies and scripts needed for Convex, Convex Auth, TypeScript checking, Vitest, and Playwright. Update `package.json` scripts from the current `dev/build/start/lint` set to include `type-check`, `test`, `test:watch`, and `test:e2e`. Install runtime dependencies `convex`, `@convex-dev/auth`, `@auth/core@0.37.0`; install dev dependencies `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@playwright/test`. Add `vitest.config.ts`, `tests/setup.ts`, and `playwright.config.ts` with `@` alias to `src`. Add `.env.local.example` entries for `NEXT_PUBLIC_CONVEX_URL`, `CONVEX_DEPLOYMENT`, and E2E credentials (`E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`) only; do not include secrets. Document in task evidence that user must run `npx convex dev` if Convex deployment files/env are not present. Configure/verify Convex MCP server for this project directory using `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor`; record whether MCP `status` can see the development deployment.
  **Must NOT do**: Do not run interactive Convex setup unattended if it prompts for login/project selection. Do not add production deployment settings. Do not add CI. Do not use Convex MCP `--prod` or `--dangerously-enable-production-deployments`.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: package/config scaffolding with clear dependencies.
  - Skills: [`convex-quickstart`] - Use local guidance for adding Convex to an existing Next.js App Router app.
  - Omitted: [`convex-migration-helper`] - No existing Convex data/schema yet.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Tasks 2, 3, 5, 7 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `package.json:5-10` - current scripts; extend, do not remove existing commands.
  - Pattern: `package.json:11-23` - remove old runtime deps later only after code cleanup; add Convex/Auth deps here.
  - Pattern: `package.json:24-34` - current dev deps; add test deps here.
  - Skill: `.agents/skills/convex-quickstart/SKILL.md:123-193` - adding Convex to existing app and App Router provider pattern.
  - Skill: `.agents/skills/convex-setup-auth/references/convex-auth.md:20-35` - Convex Auth package/init/wiring requirements.
  - External: `https://docs.convex.dev/ai/convex-mcp-server#project-directory` - Convex MCP command `npx -y convex@latest mcp start --project-dir /path/to/project`, default dev deployment, and production-safety flags.

  **Acceptance Criteria** (agent-executable only):
  - [ ] `npm run type-check` exists and invokes `tsc --noEmit`.
  - [ ] `npm run test` exists and invokes `vitest run`.
  - [ ] `npm run test:e2e` exists and invokes `playwright test`.
  - [ ] `npm run lint` still exists and invokes ESLint.
  - [ ] `npm run build` still exists and invokes Next build.
  - [ ] `vitest.config.ts`, `tests/setup.ts`, and `playwright.config.ts` exist and resolve `@/` imports.
  - [ ] Convex MCP setup evidence includes the exact command `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor` and confirms development deployment selection or records the human setup prerequisite blocking it.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Scripts are registered
    Tool: Bash
    Steps: Run `npm run type-check`; run `npm run test -- --passWithNoTests` only if Vitest/config supports it, otherwise record that real tests are added in Task 7; run `npm run lint`.
    Expected: Commands exist; if implementation has not yet added tests/code fixes, failures are recorded with exact missing follow-up, not ignored.
    Evidence: .sisyphus/evidence/task-1-foundation-scripts.txt

  Scenario: No production/secret config introduced
    Tool: Bash
    Steps: Search generated env examples and configs for real API keys, SMTP passwords, JWT secrets, or production redirect URLs.
    Expected: No real secrets; only placeholder values are present.
    Evidence: .sisyphus/evidence/task-1-foundation-secret-scan.txt

  Scenario: Convex MCP is project-scoped
    Tool: Convex MCP / Bash
    Steps: Start or verify MCP configuration with `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor`; run MCP `status` if available.
    Expected: MCP targets this project directory and default development deployment; no production flags are used.
    Evidence: .sisyphus/evidence/task-1-convex-mcp-status.txt
  ```

  **Commit**: YES | Message: `chore(setup): add convex auth and test foundation` | Files: `package.json`, `package-lock.json`, `vitest.config.ts`, `tests/setup.ts`, `playwright.config.ts`, `.env.local.example`

- [x] 2. Add Convex Provider and Email/Password Auth UI

  **What to do**: Wire Convex at the Next.js root using a client provider component created at module scope. Replace plain Convex provider with Convex Auth provider per Convex Auth setup. Add a dedicated `/login` route for local MVP signup/login using Convex Auth email/password. Add header auth controls on `/`: guest sees “Login to save”; authenticated user sees account state and logout. Logout must be available without navigating to an owner page. Use a combined login/signup UI if Convex Auth supports it; otherwise use two explicit tabs/buttons on `/login`. Email verification, password reset, OTP, magic link, and OAuth must be absent.
  **Must NOT do**: Do not implement custom password hashing, JWT cookies, email sending, or owner secret keys. Do not add `/owner` compatibility redirects.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: auth provider wiring spans root layout, client provider, and UI states.
  - Skills: [`convex-setup-auth`, `nextjs-app-router-patterns`] - Auth provider setup and App Router client/server boundary.
  - Omitted: [`frontend-design`] - Reuse existing minimalist UI; no redesign requested.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Tasks 5, 6, 7 | Blocked By: Task 1

  **References**:
  - Pattern: `src/app/layout.tsx:26-64` - root layout currently renders `{children}` and Toaster; wrap children in Convex/Auth client provider without moving Toaster unless needed.
  - Pattern: `src/app/owner/page.tsx:1-251` - delete/replace owner-only route concept; do not reuse secret/OTP behavior.
  - Pattern: `src/hooks/useOwnerAuth.ts:1-99` - remove owner-auth state/probe hook; new auth state must come from Convex Auth.
  - Skill: `.agents/skills/convex-quickstart/SKILL.md:179-193` - App Router client provider pattern.
  - Skill: `.agents/skills/convex-setup-auth/SKILL.md:24-48` - provider choice and repo-signal checks; user chose Convex Auth.
  - Skill: `.agents/skills/convex-setup-auth/references/convex-auth.md:50-64` - concrete Convex Auth setup steps.

  **Acceptance Criteria**:
  - [ ] `src/app/ConvexClientProvider.tsx` or equivalent exists as a client component and creates `ConvexReactClient` at module scope.
  - [ ] `src/app/layout.tsx` wraps app content with the Convex/Auth provider.
  - [ ] `/login` route exists for email/password signup/login.
  - [ ] `/` exposes a visible guest auth prompt and authenticated logout control.
  - [ ] No `OWNER_SECRET_KEY`, `OWNER_EMAIL`, `pending_otp`, or `owner_token` behavior is used by the new auth flow.

  **QA Scenarios**:
  ```
  Scenario: Guest sees login-to-save path
    Tool: Playwright
    Steps: Open `/`; assert header contains a visible `Login to save` or equivalent auth CTA; click it; assert URL or modal reaches `/login` auth UI with email/password controls.
    Expected: Guest can reach auth UI without owner secret, OTP, or AI-specific language.
    Evidence: .sisyphus/evidence/task-2-auth-guest-login.png

  Scenario: Owner auth is absent
    Tool: Playwright
    Steps: Navigate to `/owner`; inspect response/page; search visible text for `Owner Access`, `Secret Key`, `OTP`, and `AI features enabled`.
    Expected: `/owner` is 404, redirect to `/login`, or otherwise contains none of the owner/OTP UI text.
    Evidence: .sisyphus/evidence/task-2-owner-removed.png
  ```

  **Commit**: YES | Message: `feat(auth): add convex email password login` | Files: `src/app/layout.tsx`, `src/app/ConvexClientProvider.tsx`, `src/app/login/**`, auth-related Convex files

- [x] 3. Create Convex Diagram Schema and Ownership-Protected Functions

  **What to do**: Add Convex schema for saved diagrams and implement authenticated functions. Use `ownerTokenIdentifier: identity.tokenIdentifier` as the MVP owner key. Minimal table fields: `title`, `source`, `diagramType`, `outputFormat`, `options`, `ownerTokenIdentifier`, `createdAt`, `updatedAt`. Add indexes for listing by owner and updated time. Implement queries `listMyDiagrams`, `getMyDiagram`; mutations `createDiagram`, `updateDiagram`, `renameDiagram`, `deleteDiagram`. Every function must call `ctx.auth.getUserIdentity()` and reject unauthenticated users. Every id-based function must fetch the diagram and verify `diagram.ownerTokenIdentifier === identity.tokenIdentifier` before returning or mutating. Use clear errors: `Not authenticated`, `Diagram not found`, `Unauthorized`.
  **Must NOT do**: Do not accept client-provided `userId`/owner id. Do not create a parallel `users` table unless Convex Auth docs require it for the chosen setup. Do not add sharing/public visibility fields.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: security-sensitive backend function design.
  - Skills: [`convex-setup-auth`] - Server-side auth and authorization checks.
  - Omitted: [`convex-migration-helper`] - New table only; no existing Convex migration.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: Tasks 5, 6, 7 | Blocked By: Task 1

  **References**:
  - API/Type: `src/types/index.ts:8-27` - current `SavedDiagram`; preserve user-facing fields except `timestamp` becomes `createdAt/updatedAt`, `name` becomes `title` or keep `name` consistently if UI requires it.
  - API/Type: `src/types/index.ts:32-66` - diagram type/output format unions to validate or mirror in frontend before calling Convex.
  - Skill: `.agents/skills/convex-setup-auth/SKILL.md:80-110` - never trust client-provided user id; use `ctx.auth.getUserIdentity()`.
  - Skill: `.agents/skills/convex-setup-auth/references/convex-auth.md:112-123` - validation expectations for authenticated backend functions.
  - External: `https://docs.convex.dev/ai/convex-mcp-server#available-tools` - use MCP `tables`, `functionSpec`, `run`, and/or `logs` for development deployment verification where available.

  **Acceptance Criteria**:
  - [ ] `convex/schema.ts` includes `authTables` and `diagrams` table.
  - [ ] `convex/diagrams.ts` or equivalent exposes exactly the MVP functions: `listMyDiagrams`, `getMyDiagram`, `createDiagram`, `updateDiagram`, `renameDiagram`, `deleteDiagram`.
  - [ ] All diagram functions reject unauthenticated calls.
  - [ ] All id-based functions reject access to diagrams owned by another identity.
  - [ ] List query returns only current user diagrams sorted newest updated first.
  - [ ] Convex MCP evidence records `tables` and/or `functionSpec` output showing the `diagrams` table/functions on the development deployment, or records that Convex dev setup is still the blocking prerequisite.

  **QA Scenarios**:
  ```
  Scenario: Authenticated user owns CRUD data
    Tool: Bash
    Steps: Run Convex function/unit tests or Vitest tests that mock authenticated identity and create/list/get/update/rename/delete a diagram.
    Expected: Created diagram stores ownerTokenIdentifier from server identity; list/get/update/rename/delete work for the owner.
    Evidence: .sisyphus/evidence/task-3-convex-owned-crud.txt

  Scenario: Unauthorized access is rejected
    Tool: Bash
    Steps: Run tests with no identity and with a different identity against get/update/rename/delete.
    Expected: No identity gets `Not authenticated`; different identity gets `Unauthorized` or `Diagram not found` without data leakage.
    Evidence: .sisyphus/evidence/task-3-convex-authorization.txt

  Scenario: Convex MCP sees deployed schema/functions
    Tool: Convex MCP
    Steps: Use MCP `status`, then `tables` and `functionSpec` against the default development deployment for `/home/coder/dev/kroki_editor`.
    Expected: MCP reports the development deployment, `diagrams` table, and diagram query/mutation specs; no production deployment is selected.
    Evidence: .sisyphus/evidence/task-3-convex-mcp-schema-functions.txt
  ```

  **Commit**: YES | Message: `feat(diagrams): add owned convex diagram functions` | Files: `convex/schema.ts`, `convex/diagrams.ts`, Convex generated files if produced

- [x] 4. Remove AnythingLLM AI and Owner OTP/JWT Subsystems

  **What to do**: Delete AI API routes, AI modal/button components, AI exports/imports/usages, owner auth routes, owner login page, owner auth hook, and AI route proxy. Remove AnythingLLM env references and owner SMTP/JWT env references from examples/docs/config. Remove `lottie-react`, `nodemailer`, `@types/nodemailer`, and `jose` from package dependencies after all references are gone. Keep Kroki rendering intact.
  **Must NOT do**: Do not leave hidden AI buttons, disabled AI menu items, dead API routes returning 410, or owner route compatibility. Requirement is clean removal.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: deletion/ref cleanup with clear target list.
  - Skills: [] - No specialized implementation skill needed.
  - Omitted: [`ai-slop-remover`] - This is removal, not style cleanup of a single file.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: Task 8 | Blocked By: package coordination from Task 1

  **References**:
  - AI UI: `src/app/page.tsx:22-25`, `src/app/page.tsx:35-40`, `src/app/page.tsx:233-246` - remove AI imports/state/rendering and owner auth dependency.
  - AI components: `src/components/AIGenerateButton.tsx:1-64`, `src/components/AIGenerateModal.tsx:1-359`, `src/components/index.ts:12-13` - delete/remove exports.
  - AI routes: `src/app/api/ai/generate/route.ts:233-313`, `src/app/api/ai/fix/route.ts:67-143`, `src/app/api/ai/revise/route.ts:62-140` - delete route folders.
  - Owner auth: `src/app/api/auth/owner/route.ts:1-132`, `src/app/api/auth/verify-otp/route.ts:1-115`, `src/app/owner/page.tsx:1-251`, `src/hooks/useOwnerAuth.ts:1-99` - delete old auth subsystem.
  - Proxy: `src/proxy.ts:1-59` - remove if only protecting AI routes.
  - Package deps: `package.json:13-18` - old packages to remove once unused.

  **Acceptance Criteria**:
  - [ ] No files remain under `src/app/api/ai/`.
  - [ ] No files remain for old owner auth routes/pages/hooks.
  - [ ] No import/export references to `AIGenerateButton`, `AIGenerateModal`, or `useOwnerAuth` remain.
  - [ ] No references to `ANYTHINGLLM_`, `OWNER_SECRET_KEY`, `OWNER_EMAIL`, `SMTP_`, `JWT_SECRET`, `owner_token`, or `pending_otp` remain except in migration notes/evidence.
  - [ ] `lottie-react`, `nodemailer`, `@types/nodemailer`, and `jose` are removed if unused.

  **QA Scenarios**:
  ```
  Scenario: AI UI and routes are gone
    Tool: Playwright + Bash
    Steps: Open `/` and assert no button with accessible name/title containing `AI`, `Generate with AI`, `Fix`, or `Revise`; request `/api/ai/generate`.
    Expected: UI has no AI controls; route returns 404/405 from absence, not an AnythingLLM/custom AI response.
    Evidence: .sisyphus/evidence/task-4-ai-removed.txt

  Scenario: Owner auth residue is gone
    Tool: Bash
    Steps: Search source/package/env examples for `nodemailer`, `jose`, `OWNER_`, `SMTP_`, `JWT_SECRET`, `owner_token`, `pending_otp`, `useOwnerAuth`, `AIGenerate`.
    Expected: Zero source references; package references removed unless Convex Auth indirectly requires unrelated packages.
    Evidence: .sisyphus/evidence/task-4-owner-auth-removed.txt
  ```

  **Commit**: YES | Message: `refactor(ai-auth): remove owner ai subsystem` | Files: deleted AI/auth files, `src/app/page.tsx`, `src/components/index.ts`, `package.json`, `package-lock.json`

- [x] 5. Replace IndexedDB Storage with Convex-backed Diagram Service

  **What to do**: Remove `useDiagramStorage.ts` and `useAutoSave.ts` usage. Add a new client-facing hook/service such as `useSavedDiagrams` that wraps Convex queries/mutations for authenticated users only. It must expose manual operations for `createDiagram`, `updateCurrentDiagram`, `loadDiagram`, `deleteDiagram`, `renameDiagram`, and `listDiagrams`. Track current loaded diagram id in React state in `src/app/page.tsx` or a dedicated editor state wrapper. Manual save behavior: if authenticated and current diagram has a loaded/saved id, `Save` updates that diagram; if authenticated and no saved id, `Save` creates a new diagram with title prompted/defaulted to diagram type + date. Guest save attempts must not call Convex; they should open `/login` or show login CTA. Remove session restore from `getLastDiagram`. Do not add auto-save.
  **Must NOT do**: Do not keep `idb-keyval` as fallback. Do not read old IndexedDB keys. Do not use localStorage/sessionStorage for current diagram id or drafts.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: replaces data flow and must avoid unauthorized persistence.
  - Skills: [`vercel-react-best-practices`] - Avoid request/auth waterfalls and unstable storage reads.
  - Omitted: [`convex-migration-helper`] - No local IndexedDB migration.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Tasks 6, 7 | Blocked By: Tasks 2, 3

  **References**:
  - Current storage hook: `src/hooks/useDiagramStorage.ts:1-13` - delete idb-keyval import/storage concept.
  - Current save/load API shape: `src/hooks/useDiagramStorage.ts:163-182` - replace with Convex-backed MVP operations; omit pin/cleanup/quota.
  - Current auto-save: `src/hooks/useAutoSave.ts:42-106` - remove use and preferably delete file; no auto-save in MVP.
  - Current page storage usage: `src/app/page.tsx:12-13`, `src/app/page.tsx:57-76`, `src/app/page.tsx:92-98` - replace last-diagram restore and load handler with Convex list/load.
  - Type model: `src/types/index.ts:8-27` - update saved diagram type to server-backed field names.

  **Acceptance Criteria**:
  - [ ] No `idb-keyval` import remains.
  - [ ] `useAutoSave` is not called and no auto-save toast exists.
  - [ ] Guest save attempts do not create network mutations except navigation/auth UI.
  - [ ] Authenticated manual save creates a Convex diagram if no current saved id.
  - [ ] Authenticated manual save updates the currently loaded saved diagram if a current saved id exists.
  - [ ] Loading a diagram sets editor source/type/format/options and current saved id.

  **QA Scenarios**:
  ```
  Scenario: Guest has no persistence
    Tool: Playwright
    Steps: Open `/` as guest; edit source; wait 3 seconds; reload page; open devtools/network if available or inspect UI state.
    Expected: No auto-save toast, no saved diagram created, reload returns default template/editor state, save CTA asks for login.
    Evidence: .sisyphus/evidence/task-5-guest-no-persistence.png

  Scenario: Authenticated manual save updates current diagram
    Tool: Playwright
    Steps: Log in; edit source; click Save; load saved item; edit source again; click Save; reload and load same item.
    Expected: Only one saved item exists for that title/id; source reflects second edit.
    Evidence: .sisyphus/evidence/task-5-manual-save-update.png
  ```

  **Commit**: YES | Message: `refactor(storage): replace indexeddb with convex diagrams` | Files: `src/hooks/useDiagramStorage.ts`, `src/hooks/useAutoSave.ts`, new saved-diagram hook/service, `src/types/index.ts`, `src/app/page.tsx`

- [x] 6. Refactor Editor UI and Diagram History for Guest/Auth MVP

  **What to do**: Update the main page header and history/sidebar UI to reflect authenticated “My Diagrams” instead of browser “History”. Add explicit Save button in header or editor toolbar. For guests, show “Login to save” and disable/hide My Diagrams list or show an empty auth prompt; guests must still edit and preview diagrams. For authenticated users, My Diagrams opens Convex-backed list with load/delete/rename. Remove pin UI and retention text. Delete confirmation may remain via `confirm()` for MVP, but Playwright tests must handle it. If deleting the currently loaded diagram, clear current saved id and keep the editor content as unsaved in memory. If loading another diagram while current editor has unsaved changes, use a simple `confirm('Discard unsaved changes?')`; if user cancels, do not load. On logout with unsaved changes, keep current in-memory editor content but clear current saved id and hide My Diagrams until login.
  **Must NOT do**: Do not add folders/search/tags/pinning/public share. Do not use browser storage for dirty state.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: user-facing auth/save/history state refactor.
  - Skills: [`frontend-design`, `nextjs-app-router-patterns`] - Maintain UI quality and App Router boundaries.
  - Omitted: [`tailwind-design-system`] - Existing Tailwind classes are sufficient; no design-system expansion.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Task 7 | Blocked By: Tasks 2, 3, 5

  **References**:
  - Main header controls: `src/app/page.tsx:100-143` - add auth/save/my diagrams controls without breaking selectors/type/format controls.
  - Mobile history action: `src/app/page.tsx:151-162` - convert to My Diagrams/auth-gated control.
  - Existing history sidebar: `src/components/DiagramHistory.tsx:24-56` - replace storage hook with Convex list state.
  - Existing empty-state text: `src/components/DiagramHistory.tsx:248-257` - replace “auto-save as you type” with manual-save/auth copy.
  - Existing rename/delete handlers: `src/components/DiagramHistory.tsx:100-147` - keep delete/rename behavior, remove pin.
  - Existing pinned handler: `src/components/DiagramHistory.tsx:116-124` - remove pin support from MVP UI.

  **Acceptance Criteria**:
  - [ ] Header exposes a manual Save action for authenticated users.
  - [ ] Guest UI exposes login-to-save and does not imply diagrams are auto-saved.
  - [ ] Sidebar title/copy uses “My Diagrams” or equivalent, not “History” as browser-local history.
  - [ ] Pin UI and auto-cleanup/auto-save text are gone.
  - [ ] Delete current diagram leaves editor content in memory as unsaved and removes it from list.
  - [ ] Load-with-unsaved-changes cancellation preserves current editor content.

  **QA Scenarios**:
  ```
  Scenario: Authenticated user manages My Diagrams
    Tool: Playwright
    Steps: Log in; save diagram titled `MVP Smoke Diagram`; open My Diagrams; rename to `MVP Smoke Diagram Renamed`; load it; delete it; reopen My Diagrams.
    Expected: Rename appears; load updates editor; delete removes item; no pin controls visible.
    Evidence: .sisyphus/evidence/task-6-my-diagrams-crud.png

  Scenario: Unsaved changes guard works
    Tool: Playwright
    Steps: Log in; save diagram A; edit current source without saving; attempt to load diagram B; cancel browser confirm; then accept on second attempt.
    Expected: Cancel preserves unsaved source; accept loads diagram B source and current saved id.
    Evidence: .sisyphus/evidence/task-6-unsaved-guard.png
  ```

  **Commit**: YES | Message: `feat(ui): add auth gated diagram management` | Files: `src/app/page.tsx`, `src/components/DiagramHistory.tsx`, related auth/save UI components

- [x] 7. Add Minimal Unit and E2E Coverage

  **What to do**: Add Vitest tests for practical pure logic and Convex-facing behavior that can run locally without a browser where feasible. At minimum test saved-diagram validation/mapping helpers and auth-gated UI logic if extracted. Add Playwright smoke tests for guest editor/preview, guest cannot save, email/password signup/login using `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD`, save/list/load/rename/delete, AI UI absence, owner route absence. Add `data-testid` attributes only where needed for reliable tests. Tests may assume user has completed local Convex setup and `npx convex dev` is running; document this in test README/evidence.
  **Must NOT do**: Do not make tests depend on real SMTP, AnythingLLM, production Convex, or existing IndexedDB data. Do not skip tests silently if Convex is unavailable; fail with a clear prerequisite message.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: cross-cutting verification for auth/storage/UI behavior.
  - Skills: [`nextjs-app-router-patterns`] - Browser and route behavior in App Router.
  - Omitted: [`frontend-design`] - Tests only; no aesthetic changes except selectors.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Task 8 | Blocked By: Tasks 1, 2, 3, 5, 6

  **References**:
  - Test infrastructure from Task 1: `package.json:5-10` after scripts added.
  - Guest editor state: `src/hooks/useDiagramEditor.ts:52-113` - editor/preview should still work without auth.
  - Auth/save UI from Tasks 2 and 6 - add stable selectors like `data-testid="login-to-save"`, `data-testid="save-diagram"`, `data-testid="my-diagrams"`.
  - Removed AI references from Task 4 - assert absence.
  - External: `https://docs.convex.dev/ai/convex-mcp-server#function-tools` - MCP `run` can execute deployed Convex functions during local development verification where auth/test setup permits it.

  **Acceptance Criteria**:
  - [ ] `npm run test` passes.
  - [ ] `npm run test:e2e` passes when local Convex and Next dev prerequisites are available.
  - [ ] Playwright smoke verifies all nine Metis-required points: guest editor, guest cannot save, signup/login, save, list, load, rename, delete, deleted item absent.
  - [ ] Playwright asserts AI controls are absent.
  - [ ] Playwright asserts `/owner` is absent or no longer shows old owner UI.
  - [ ] E2E evidence records whether Convex MCP was used to inspect logs/status for failed tests when debugging Convex issues.

  **QA Scenarios**:
  ```
  Scenario: Full MVP smoke flow
    Tool: Playwright
    Steps: Run `npm run test:e2e` with E2E credentials; capture trace/screenshot on failure.
    Expected: Guest, login, save/list/load/rename/delete, AI absence, and owner absence all pass.
    Evidence: .sisyphus/evidence/task-7-e2e-smoke.txt

  Scenario: Unit tests validate mapping and guards
    Tool: Bash
    Steps: Run `npm run test`.
    Expected: Vitest passes for saved diagram helper/validation/auth guard behavior introduced by implementation.
    Evidence: .sisyphus/evidence/task-7-vitest.txt

  Scenario: Convex MCP debug path is available
    Tool: Convex MCP
    Steps: If E2E fails due to Convex behavior, use MCP `logs` or `functionSpec` on the development deployment and attach findings.
    Expected: Debug evidence identifies function/schema/auth issue without using production access.
    Evidence: .sisyphus/evidence/task-7-convex-mcp-debug.txt
  ```

  **Commit**: YES | Message: `test(mvp): cover auth gated diagram storage` | Files: `tests/**`, `e2e/**` or `*.spec.ts`, UI files with test IDs

- [x] 8. Final Cleanup, Dependency Prune, and Build Verification

  **What to do**: Run project-wide cleanup after all refactors. Remove unused files, exports, dependencies, env examples, comments, and docs referring to IndexedDB, auto-save, AI, AnythingLLM, owner auth, OTP, SMTP, JWT, or single-owner access. Ensure `README.md` no longer describes create-next-app defaults only if implementation chooses to update docs; at minimum add local MVP setup notes somewhere appropriate if README is touched. Run install/prune as needed so lockfile matches package. Verify no stale imports remain.
  **Must NOT do**: Do not add production rollout docs beyond local MVP prerequisites. Do not create additional feature docs outside explicit local setup notes.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: broad cleanup and verification across repo.
  - Skills: [`vercel-react-best-practices`] - Catch dead imports and avoid client/server performance regressions.
  - Omitted: [`ai-slop-remover`] - Multi-file cleanup, not a single-file style pass.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final Verification | Blocked By: Tasks 4, 6, 7

  **References**:
  - Package cleanup: `package.json:11-23` - old runtime deps must be gone if unused.
  - Layout metadata: `src/app/layout.tsx:16-24` - update description if “pure client-side” is no longer accurate.
  - Storage comments: `src/types/index.ts:5-7` - update IndexedDB wording.
  - Existing README: `README.md` - currently generic Next.js starter; optional local setup notes can replace generic text if changed.

  **Acceptance Criteria**:
  - [ ] `npm run type-check` passes.
  - [ ] `npm run lint` passes.
  - [ ] `npm run test` passes.
  - [ ] `npm run build` passes.
  - [ ] Search for removed terms returns zero source references: `idb-keyval`, `IndexedDB`, `Auto-saved`, `AnythingLLM`, `/api/ai`, `AIGenerate`, `Owner Access`, `OWNER_`, `SMTP_`, `JWT_SECRET`, `owner_token`, `pending_otp`, `nodemailer`, `jose`.
  - [ ] `package-lock.json` matches `package.json`.

  **QA Scenarios**:
  ```
  Scenario: Clean verification suite
    Tool: Bash
    Steps: Run `npm run type-check && npm run lint && npm run test && npm run build`.
    Expected: All commands pass without stale imports, type errors, or build failures.
    Evidence: .sisyphus/evidence/task-8-verification-suite.txt

  Scenario: Removed stack scan
    Tool: Bash
    Steps: Search source, package files, and env examples for removed stack terms listed in acceptance criteria.
    Expected: Zero source references; any README mention must be only historical migration note if explicitly added, otherwise zero.
    Evidence: .sisyphus/evidence/task-8-removed-stack-scan.txt
  ```

  **Commit**: YES | Message: `chore(cleanup): prune removed auth ai storage stacks` | Files: package files, docs/env examples, cleanup edits

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright)
- [ ] F4. Scope Fidelity Check — deep
## Commit Strategy
- Commit per task where feasible using messages listed above.
- Do not push unless the user explicitly requests it.
- If Convex generated files change during setup, include them in the relevant Convex/auth commit.
- Never commit `.env.local` or real credentials.

## Success Criteria
- Local MVP can be run with Convex dev + Next dev.
- Guest can edit and preview diagrams but cannot save or see persisted diagrams.
- Email/password registered user can log in and log out.
- Authenticated user can save/list/load/delete/rename only their own diagrams.
- AI and owner-auth surfaces are fully removed, not merely disabled.
- Browser-local diagram persistence is fully removed with no migration/fallback.
- Verification commands and Playwright smoke pass.
