# TailAdmin Diagram Dashboard

## TL;DR
> **Summary**: Add a separate authenticated `/dashboard` route with a TailAdmin-inspired React/Tailwind UI for listing, viewing, editing via the existing editor, and permanently deleting saved diagrams.
> **Deliverables**:
> - `/dashboard` App Router route with TailAdmin-style shell, header, sidebar, table, detail/preview panel, empty/loading/error states.
> - URL/query-based edit handoff so dashboard Edit opens `/` and loads the selected diagram.
> - Permanent delete confirmation modal with cancel/confirm/error handling.
> - Tests-after coverage with Vitest and Playwright.
> **Effort**: Medium
> **Parallel**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Task 3/4 → Task 5 → Task 6/7

## Context
### Original Request
User requested a new plan to add a TailAdmin dashboard for diagram management: seeing diagrams, editing diagrams, and deleting diagrams, using `https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template` plus relevant frontend, Next.js App Router, Tailwind design-system, and Vercel/React best-practice skills/patterns.

### Interview Summary
- Dashboard scope: separate `/dashboard` route, not replacing current `/` editor or current diagram sidebar.
- Delete behavior: permanent delete after explicit confirmation.
- View/edit flow: dashboard lists diagrams and shows a read-only detail/preview; Edit opens the selected diagram in existing editor route `/`.
- TailAdmin depth: selected components only; React-convert shell/header/sidebar/table/detail/modal patterns.
- Test strategy: tests-after, reusing existing Vitest/Playwright infrastructure.

### Metis Review (gaps addressed)
- **Edit handoff gap**: resolved with URL/query-based handoff: dashboard navigates to `/?diagramId=<id>`, and `/` loads that diagram through existing Convex-backed data flow.
- **Table scope gap**: MVP columns fixed as name, diagram type, updated date, created date, and row actions. Search/filter/pagination/sorting/bulk actions are explicitly out of scope except simple client-side empty/loading states.
- **Auth behavior gap**: `/dashboard` redirects unauthenticated users to `/login?next=/dashboard`; it does not render a guest dashboard.
- **Preview gap**: dashboard detail should render actual diagram preview when feasible using existing preview component; fallback shows source/metadata with an explicit render error state.
- **Guardrails added**: no Alpine.js, no TailAdmin Webpack pipeline, no embedded editor, no current editor redesign, no analytics/settings/folders/sharing/bulk actions.

### Requested Pattern Guidance
- Frontend/design skill guidance is encoded through `frontend-ui-ux` agent profiles for visual tasks.
- Next.js App Router guidance is encoded as route placement under `src/app/dashboard/`, provider preservation from `src/app/layout.tsx`, and client/server boundary guardrails.
- Tailwind design-system guidance is encoded as Tailwind v4 CSS-first reuse through `src/app/globals.css`; no new Tailwind config by default.
- Vercel/React best-practice guidance is encoded as React state/hooks instead of Alpine.js, stable route/query handoff, hydration-safe client-only dashboard behavior, and build/type/lint gates.

## Work Objectives
### Core Objective
Create an authenticated TailAdmin-inspired diagram management dashboard that reuses existing Convex diagram storage and preserves the current guest-capable editor experience.

### Deliverables
- New `/dashboard` route under `src/app/dashboard/`.
- Dashboard UI components under `src/components/dashboard/` or an equivalent local namespace.
- URL query edit/load support in the existing editor route for `diagramId`.
- Navigation affordances between editor and dashboard.
- Unit/component tests for pure helpers and dashboard state behavior where feasible.
- Playwright e2e scenarios for auth, list/view/edit/delete, and edge cases.

### Definition of Done (verifiable conditions with commands)
- `npm run type-check` exits `0`.
- `npm run lint` exits `0`.
- `npm run test` exits `0`.
- `npm run build` exits `0`.
- `npm run test:e2e` exits `0` when local Convex/Auth preflight passes.
- `/` remains usable for unauthenticated guest editing exactly as before.
- `/dashboard` is unavailable to unauthenticated users and redirects to login.
- Authenticated users can list, view/preview, edit-open, cancel delete, and confirm delete saved diagrams.

### Must Have
- TailAdmin-inspired shell/header/sidebar/table/detail/modal visual language adapted to React and existing Tailwind v4 CSS-first setup.
- `data-testid` selectors for all dashboard-critical flows.
- Loading state, empty state, error state, long-name handling, and narrow viewport behavior.
- Permanent delete confirmation with cancel, confirm, pending, and mutation-failure UI states.
- Edit handoff through `/?diagramId=<id>` and robust handling for missing/deleted/unauthorized IDs.

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Do not import TailAdmin's Alpine.js, Webpack config, global JS, HTML include pipeline, or wholesale template app.
- Do not add a `tailwind.config.*` unless a concrete blocker proves it is necessary; prefer existing Tailwind v4 CSS-first `src/app/globals.css` patterns.
- Do not duplicate the full editor inside dashboard.
- Do not remove or replace the current root editor or `DiagramHistory` sidebar.
- Do not add analytics widgets, billing, teams, settings, folders, tags, sharing, comments, pagination, sorting, filtering, or bulk actions.
- Do not require manual human visual confirmation for acceptance.
- Avoid generic TailAdmin copy/paste artifacts such as promo upsell boxes, dummy ecommerce labels, unused chart packages, or dead navigation links.

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: tests-after using existing Vitest + Playwright.
- QA policy: Every task has agent-executed scenarios.
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`.

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: Task 1 foundation edit handoff + route/auth boundary; Task 2 TailAdmin dashboard component foundation. Under target count by necessity: these are the only independent foundations.
Wave 2: Task 3 diagram table/list states; Task 4 detail/preview/edit action; Task 5 delete confirmation flow.
Wave 3: Task 6 navigation/responsive polish; Task 7 tests and verification. Under target count by necessity: both depend on prior UI/data tasks.

### Dependency Matrix (full, all tasks)
| Task | Depends On | Blocks |
|---|---|---|
| 1. Add dashboard route/auth and editor query handoff | none | 3, 4, 7 |
| 2. Build TailAdmin React dashboard shell components | none | 3, 4, 5, 6, 7 |
| 3. Implement dashboard diagram table states | 1, 2 | 4, 5, 7 |
| 4. Implement detail preview and Edit-to-editor flow | 1, 2, 3 | 7 |
| 5. Implement permanent delete confirmation | 2, 3 | 7 |
| 6. Add navigation and responsive visual polish | 2, 3, 4, 5 | 7 |
| 7. Add tests-after coverage and verification evidence | 1, 2, 3, 4, 5, 6 | Final Verification |

### Agent Dispatch Summary (wave → task count → categories)
| Wave | Tasks | Categories |
|---|---:|---|
| 1 | 2 | `quick`, `visual-engineering` |
| 2 | 3 | `visual-engineering`, `quick` |
| 3 | 2 | `visual-engineering`, `quick` |
| Final | 4 reviewers | `oracle`, `unspecified-high`, `deep` |

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Add `/dashboard` route, auth redirect, and editor `diagramId` query handoff

  **What to do**: Add a new App Router route at `src/app/dashboard/page.tsx` that is a client-side authenticated dashboard entry. Use `useConvexAuth()` and existing navigation behavior to redirect unauthenticated users to `/login?next=/dashboard`. Add support in the existing root editor route so `/?diagramId=<id>` loads that saved diagram through the existing Convex-backed flow. If the ID is missing, deleted, or unauthorized, show a non-blocking error toast/state and keep the editor usable. Preserve guest behavior on `/` when no `diagramId` is provided.
  **Must NOT do**: Do not make `/` auth-only. Do not embed a new editor in `/dashboard`. Do not invent localStorage/client-state-only handoff.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: route/auth/data-flow foundation with limited UI.
  - Skills: [`frontend-ui-ux`] - Use only for user-facing loading/error affordances; apply Next.js App Router and React/Vercel best practices from this plan.
  - Omitted: [`git-master`] - No commit requested inside individual task execution unless executor workflow requires it.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 7 | Blocked By: none

  **References** (executor has NO interview context - be exhaustive):
  - Pattern: `src/app/page.tsx:70-71` - existing `useConvexAuth()` usage.
  - Pattern: `src/app/page.tsx:150-180` - existing unauthenticated save redirect/auth gating pattern.
  - Pattern: `src/app/login/page.tsx:11-157` - login page signed-in/signed-out handling.
  - Pattern: `src/proxy.ts:1-12` - Convex Auth Next middleware/proxy.
  - API/Type: `src/hooks/useSavedDiagrams.ts:67-177` - client diagram load/save/delete abstraction.
  - API/Type: `convex/diagrams.ts:46-213` - server list/get/create/update/rename/delete mutations and ownership checks.
  - API/Type: `src/types/index.ts:9-192` - shared diagram-related types.

  **Acceptance Criteria** (agent-executable only):
  - [ ] Visiting `/dashboard` while signed out redirects to `/login?next=/dashboard` or lands on `/login` with return intent preserved in code/test.
  - [ ] Visiting `/` signed out with no `diagramId` still renders the guest editor.
  - [ ] Visiting `/?diagramId=<validOwnedId>` signed in loads that diagram into the existing editor.
  - [ ] Visiting `/?diagramId=<missingOrDeletedId>` does not crash and shows a deterministic error state/toast.
  - [ ] `npm run type-check` exits `0` after this task.

  **QA Scenarios** (MANDATORY - task incomplete without these):
  ```
  Scenario: Unauthenticated dashboard access redirects to login
    Tool: Playwright
    Steps: Open `/dashboard`; wait for URL or page state; inspect URL/path and login form selectors from `src/app/login/page.tsx`.
    Expected: User is not shown `[data-testid="dashboard-shell"]`; login UI is visible and return target for `/dashboard` is preserved.
    Evidence: .sisyphus/evidence/task-1-dashboard-auth-redirect.txt

  Scenario: Guest editor remains available
    Tool: Playwright
    Steps: Open `/`; do not sign in; type `graph TD; A-->B` into the existing editor textarea; wait for preview behavior used by existing smoke tests.
    Expected: Editor accepts input; no forced redirect to `/login` occurs.
    Evidence: .sisyphus/evidence/task-1-guest-editor-preserved.txt
  ```

  **Commit**: YES | Message: `feat(dashboard): add protected route and edit handoff` | Files: [`src/app/dashboard/page.tsx`, `src/app/page.tsx`, supporting hook/component files if needed]

- [x] 2. React-convert selected TailAdmin shell/header/sidebar foundations

  **What to do**: Create local dashboard components such as `DashboardShell`, `DashboardSidebar`, `DashboardHeader`, and shared dashboard UI primitives under `src/components/dashboard/`. Adapt visual patterns from TailAdmin's linked HTML template: `flex h-screen overflow-hidden` shell, left sidebar, sticky top header, search-like header area if useful, dark-compatible neutral surfaces, and table/card containers. Implement with React state/hooks, existing Tailwind v4 classes, and existing semantic classes from `globals.css`. Include required `data-testid`: `dashboard-shell`, `dashboard-sidebar`, `dashboard-header`, `dashboard-content`.
  **Must NOT do**: Do not add Alpine.js. Do not copy Webpack config or HTML include system. Do not include TailAdmin promo/upsell boxes, ecommerce sample links, charts, maps, calendars, or dummy navigation.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: dashboard shell needs careful responsive UI and TailAdmin-to-React adaptation.
  - Skills: [`frontend-ui-ux`] - Needed for TailAdmin-inspired, non-generic UI polish while respecting existing design system.
  - Omitted: [`ai-slop-remover`] - Use only after implementation if generated UI looks generic; not required for initial build.

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 3, 4, 5, 6, 7 | Blocked By: none

  **References**:
  - Pattern: `src/app/layout.tsx:2-6, 28-67` - root providers, fonts, toaster; do not duplicate providers.
  - Pattern: `src/app/globals.css:1-239` - Tailwind v4 CSS-first tokens and semantic classes (`.btn-primary`, `.card-elevated`, `.input`, `.badge-accent`).
  - Pattern: `postcss.config.mjs:1-7` - Tailwind v4 PostCSS plugin setup.
  - External: `https://github.com/TailAdmin/tailadmin-free-tailwind-dashboard-template` - TailAdmin HTML + Alpine + Tailwind v4 reference; visual extraction only.
  - External: TailAdmin patterns to adapt: sidebar, header, `table-01.html`, grid/card shell; do not import build pipeline.

  **Acceptance Criteria**:
  - [ ] `/dashboard` renders `data-testid="dashboard-shell"`, `dashboard-sidebar`, `dashboard-header`, and `dashboard-content` for an authenticated user.
  - [ ] Sidebar contains only relevant app nav: Editor and Diagrams/Dashboard.
  - [ ] Header identifies diagram dashboard context and includes a link/action back to editor.
  - [ ] No `alpinejs`, TailAdmin Webpack config, chart libraries, calendar libraries, or template image assets are added unless explicitly justified in evidence.
  - [ ] `npm run lint` exits `0` after this task.

  **QA Scenarios**:
  ```
  Scenario: Authenticated dashboard shell renders
    Tool: Playwright
    Steps: Use existing auth/signup pattern from `tests/e2e/mvp-smoke.spec.ts`; open `/dashboard`; query `[data-testid="dashboard-shell"]`, `[data-testid="dashboard-sidebar"]`, `[data-testid="dashboard-header"]`.
    Expected: All selectors are visible; no console/runtime error is emitted.
    Evidence: .sisyphus/evidence/task-2-dashboard-shell.png

  Scenario: Mobile shell does not overflow unusably
    Tool: Playwright
    Steps: Set viewport to 375x812; open `/dashboard`; inspect `[data-testid="dashboard-shell"]` and sidebar toggle/collapsed behavior if implemented.
    Expected: Main content remains reachable; no horizontal overflow hides row actions.
    Evidence: .sisyphus/evidence/task-2-mobile-shell.png
  ```

  **Commit**: YES | Message: `feat(dashboard): add tailadmin shell components` | Files: [`src/components/dashboard/*`, `src/app/dashboard/page.tsx`, `src/app/globals.css` only if new semantic utilities are necessary]

- [x] 3. Implement diagram table with list, loading, empty, and error states

  **What to do**: Add a TailAdmin-inspired diagram table/list component that uses existing saved diagram data. MVP columns are exactly: Name, Type, Updated, Created, Actions. Include stable row `data-testid="diagram-row"` and table `data-testid="diagram-table"`. Display loading skeleton/state, empty state for zero diagrams, and error state for failed list access. Long names must truncate visually but expose full name via `title` or accessible label.
  **Must NOT do**: No pagination, sorting, filtering, search, folders, bulk actions, or server schema changes unless a blocking type mismatch requires a tiny helper.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: table density, empty states, and responsive actions are UI-heavy.
  - Skills: [`frontend-ui-ux`] - Needed for TailAdmin-style table/card polish and accessibility states.
  - Omitted: [`git-master`] - Not needed unless committing.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 4, 5, 7 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/components/DiagramHistory.tsx:32-398` - current list/load/rename/delete/current-diagram UI patterns.
  - API/Type: `src/hooks/useSavedDiagrams.ts:67-177` - source for saved diagrams and operations.
  - API/Type: `convex/schema.ts:5-52` - diagram fields and owner updated index.
  - Pattern: `src/app/globals.css:1-239` - card, button, input, badge classes.
  - External: TailAdmin `table-01.html` - visual reference for table rows, status badges, and row actions only.

  **Acceptance Criteria**:
  - [ ] Authenticated `/dashboard` shows `[data-testid="diagram-table"]` when diagrams exist.
  - [ ] Each diagram row includes name, type, updated date, created date, Edit button, View/select button or row selection, and Delete button.
  - [ ] Zero diagrams shows `[data-testid="empty-diagrams-state"]` with clear CTA back to editor.
  - [ ] Loading state shows `[data-testid="diagram-table-loading"]` before data resolves.
  - [ ] List error state shows `[data-testid="diagram-table-error"]` with non-sensitive message.

  **QA Scenarios**:
  ```
  Scenario: Diagram table renders saved diagrams
    Tool: Playwright
    Steps: Sign up/sign in using existing e2e pattern; create/save a diagram through `/`; open `/dashboard`; query `[data-testid="diagram-table"]` and `[data-testid="diagram-row"]`.
    Expected: At least one row is visible with the saved diagram name and row action buttons.
    Evidence: .sisyphus/evidence/task-3-diagram-table.png

  Scenario: Empty state renders for new authenticated account
    Tool: Playwright
    Steps: Sign up with a fresh unique test account; open `/dashboard`; ensure no diagrams are created first.
    Expected: `[data-testid="empty-diagrams-state"]` is visible and `[data-testid="diagram-row"]` count is 0.
    Evidence: .sisyphus/evidence/task-3-empty-state.png
  ```

  **Commit**: YES | Message: `feat(dashboard): add diagram table states` | Files: [`src/components/dashboard/*`, `src/app/dashboard/page.tsx`]

- [x] 4. Implement read-only diagram detail/preview and Edit action to existing editor

  **What to do**: Add a detail panel or detail section in `/dashboard` that shows the selected diagram's metadata, source summary, and actual diagram preview when feasible using existing preview/rendering components. Provide `data-testid="diagram-detail"` and `data-testid="diagram-preview"`. Add `data-testid="edit-diagram-button"` that navigates to `/?diagramId=<selectedId>`. If preview rendering fails, show deterministic render error UI while preserving metadata/source display.
  **Must NOT do**: Do not embed the full editor, Monaco, or mutable code editor in dashboard. Do not make Edit mutate diagram content directly from dashboard.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: combines data state, preview layout, accessibility, and route handoff.
  - Skills: [`frontend-ui-ux`] - Needed for a clear master-detail experience and TailAdmin card design.
  - Omitted: [`playwright`] - Skill not needed in implementation task; QA scenario uses Playwright tool.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 1, 2, 3

  **References**:
  - Pattern: `src/components/DiagramPreview.tsx` - existing preview rendering behavior and loading/error handling.
  - Pattern: `src/app/page.tsx` - current editor state and load behavior.
  - API/Type: `src/hooks/useSavedDiagrams.ts:67-177` - load selected diagram and map saved diagram payloads.
  - API/Type: `convex/diagrams.ts:46-213` - `getMyDiagram` authorization behavior.

  **Acceptance Criteria**:
  - [ ] Selecting a row opens/updates `[data-testid="diagram-detail"]` without navigating away.
  - [ ] Detail shows diagram name, type, created/updated dates, and source/code snippet or full read-only code area.
  - [ ] `[data-testid="diagram-preview"]` renders actual preview when valid source/type can render.
  - [ ] Preview failure shows `[data-testid="diagram-preview-error"]` and does not break the dashboard shell.
  - [ ] Clicking `[data-testid="edit-diagram-button"]` navigates to `/?diagramId=<id>` and the root editor loads the selected diagram.

  **QA Scenarios**:
  ```
  Scenario: View selected diagram in dashboard
    Tool: Playwright
    Steps: Create/save a valid diagram; open `/dashboard`; click the row or `[data-testid="view-diagram-button"]`; inspect `[data-testid="diagram-detail"]` and `[data-testid="diagram-preview"]`.
    Expected: Detail shows the saved diagram metadata and preview area; no editor textarea is present inside dashboard detail.
    Evidence: .sisyphus/evidence/task-4-detail-preview.png

  Scenario: Edit opens existing editor with selected diagram
    Tool: Playwright
    Steps: From selected dashboard row, click `[data-testid="edit-diagram-button"]`; wait for URL `/` with `diagramId`; inspect existing editor content.
    Expected: Root editor is visible and contains the selected diagram source/name; `/dashboard` no longer displayed.
    Evidence: .sisyphus/evidence/task-4-edit-handoff.txt
  ```

  **Commit**: YES | Message: `feat(dashboard): add diagram preview and edit handoff` | Files: [`src/components/dashboard/*`, `src/app/dashboard/page.tsx`, `src/app/page.tsx` if handoff support is refined]

- [x] 5. Implement delete confirmation modal with permanent delete behavior

  **What to do**: Add a confirmation modal/dialog for row delete actions. Use `data-testid="delete-diagram-button"`, `confirm-delete-modal`, `cancel-delete-button`, and `confirm-delete-button`. The modal copy must explicitly state deletion is permanent. On cancel, no mutation runs. On confirm, call existing delete behavior and remove the row/detail selection after success. Show pending state and a deterministic error message on mutation failure.
  **Must NOT do**: No soft-delete/trash/undo. No browser `confirm()` dialog for final UI unless tests already depend on it; use an accessible in-app modal.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: bounded CRUD action and modal state using existing delete mutation.
  - Skills: [`frontend-ui-ux`] - Needed for accessible confirmation and destructive action styling.
  - Omitted: [`deep`] - No architecture change required.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 7 | Blocked By: 2, 3

  **References**:
  - Pattern: `src/components/DiagramHistory.tsx:32-398` - existing delete and rename interaction patterns.
  - API/Type: `src/hooks/useSavedDiagrams.ts:67-177` - `deleteDiagram` client hook behavior.
  - API/Type: `convex/diagrams.ts:46-213` - permanent server delete mutation and ownership enforcement.
  - Pattern: `src/app/globals.css:1-239` - destructive/error colors and button styles.

  **Acceptance Criteria**:
  - [ ] Clicking Delete opens `[data-testid="confirm-delete-modal"]` and does not delete immediately.
  - [ ] Clicking Cancel closes modal and preserves the row.
  - [ ] Clicking Confirm deletes permanently and removes the row from table/detail state.
  - [ ] Delete pending state disables duplicate confirm clicks.
  - [ ] Delete failure shows `[data-testid="delete-error"]` and keeps the row visible.

  **QA Scenarios**:
  ```
  Scenario: Cancel delete preserves diagram
    Tool: Playwright
    Steps: Save a diagram; open `/dashboard`; click `[data-testid="delete-diagram-button"]`; click `[data-testid="cancel-delete-button"]`.
    Expected: Modal closes and the diagram row remains visible.
    Evidence: .sisyphus/evidence/task-5-delete-cancel.png

  Scenario: Confirm delete removes diagram
    Tool: Playwright
    Steps: Save a diagram; open `/dashboard`; click delete; click `[data-testid="confirm-delete-button"]`; wait for row removal.
    Expected: Deleted diagram row is gone; if no diagrams remain, `[data-testid="empty-diagrams-state"]` appears.
    Evidence: .sisyphus/evidence/task-5-delete-confirm.png
  ```

  **Commit**: YES | Message: `feat(dashboard): add delete confirmation` | Files: [`src/components/dashboard/*`, `src/app/dashboard/page.tsx`]

- [x] 6. Add dashboard navigation, responsive polish, and accessibility hardening

  **What to do**: Add navigation from the root editor to `/dashboard` for signed-in users and from dashboard back to editor. Polish responsive behavior for TailAdmin-style sidebar/table/detail on desktop and mobile. Ensure focus management for modal, keyboard Escape/cancel behavior, accessible labels for row actions, and meaningful empty/error copy. Use existing app style tokens and avoid visual drift.
  **Must NOT do**: Do not redesign the whole landing/editor page. Do not add unrelated profile/settings/dropdown menus with dead links.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: responsive UI, accessibility, and design consistency.
  - Skills: [`frontend-ui-ux`] - Needed for refined UX and non-generic TailAdmin adaptation.
  - Omitted: [`ultrabrain`] - Not a logic-heavy task.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: 7 | Blocked By: 2, 3, 4, 5

  **References**:
  - Pattern: `src/app/page.tsx:381-388` - existing placement of diagram history/sidebar area.
  - Pattern: `src/components/index.ts:5-11` - component barrel export convention if new dashboard components should be exported.
  - Pattern: `src/app/globals.css:1-239` - global motion/focus/button/card semantics.
  - External: TailAdmin sidebar/header visual patterns from linked repo; adapt only relevant navigation shell.

  **Acceptance Criteria**:
  - [ ] Signed-in root editor exposes a visible Dashboard navigation action.
  - [ ] Dashboard exposes visible Editor navigation action.
  - [ ] Keyboard users can open and close delete modal with focus preserved/restored.
  - [ ] At 375px width, table actions remain usable and detail content does not create blocking horizontal overflow.
  - [ ] Long names and large source content remain readable/truncated without layout breakage.

  **QA Scenarios**:
  ```
  Scenario: Navigation between editor and dashboard
    Tool: Playwright
    Steps: Sign in; open `/`; click dashboard navigation; click editor navigation from dashboard.
    Expected: URLs transition `/` → `/dashboard` → `/`; auth state remains signed in.
    Evidence: .sisyphus/evidence/task-6-navigation.txt

  Scenario: Delete modal keyboard accessibility
    Tool: Playwright
    Steps: Open `/dashboard`; focus a delete button; press Enter; verify modal focus; press Escape or activate cancel.
    Expected: Modal opens, focus lands inside modal, Escape/cancel closes it, focus returns to triggering delete button.
    Evidence: .sisyphus/evidence/task-6-modal-keyboard.txt
  ```

  **Commit**: YES | Message: `polish(dashboard): add navigation and responsive states` | Files: [`src/app/page.tsx`, `src/components/dashboard/*`, `src/app/globals.css` if necessary]

- [x] 7. Add tests-after coverage and run full verification suite

  **What to do**: Add or update Vitest and Playwright tests for dashboard behavior. Prefer component/helper unit tests for pure mapping/date/empty/error helpers if they exist; otherwise focus on Playwright e2e. Extend existing e2e smoke patterns with dashboard scenarios and Convex preflight. Record command outputs in `.sisyphus/evidence/`. Ensure selectors are stable and match the required `data-testid` values.
  **Must NOT do**: Do not create a GitHub Actions workflow. Do not weaken existing tests or skip Convex preflight. Do not mark tests as passing if local environment preflight fails; record preflight failure separately and run all non-blocked checks.

  **Recommended Agent Profile**:
  - Category: `quick` - Reason: tests and verification using existing infrastructure.
  - Skills: [] - Existing project test patterns are sufficient.
  - Omitted: [`frontend-ui-ux`] - UI implementation complete; this task is verification-focused.

  **Parallelization**: Can Parallel: NO | Wave 3 | Blocks: Final Verification | Blocked By: 1, 2, 3, 4, 5, 6

  **References**:
  - Test: `vitest.config.ts` - unit test config; excludes `tests/e2e/**`.
  - Test: `tests/setup.ts` - Vitest DOM matchers setup.
  - Test: `tests/unit/useSavedDiagrams.test.ts` - examples for hook helper testing and auth error assertions.
  - Test: `playwright.config.ts` - e2e config and dev server.
  - Test: `tests/e2e/mvp-smoke.spec.ts` - current auth/save/rename/load/delete/404 patterns.
  - Test: `tests/e2e/convexPreflight.ts` - local Convex/Auth preflight pattern.
  - Scripts: `package.json` - `type-check`, `lint`, `test`, `build`, `test:e2e`.

  **Acceptance Criteria**:
  - [ ] Tests cover unauthenticated dashboard redirect/login behavior.
  - [ ] Tests cover authenticated dashboard list/table behavior.
  - [ ] Tests cover empty state for a fresh account.
  - [ ] Tests cover detail/preview selection and Edit handoff to `/` with `diagramId`.
  - [ ] Tests cover delete cancel and delete confirm behavior.
  - [ ] Evidence files include outputs for `npm run type-check`, `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e` or documented local Convex preflight block.

  **QA Scenarios**:
  ```
  Scenario: Full verification suite
    Tool: Bash
    Steps: Run `npm run type-check && npm run lint && npm run test && npm run build`; then run `npm run test:e2e` if `tests/e2e/convexPreflight.ts` passes.
    Expected: Commands exit 0; if e2e preflight blocks, evidence contains exact preflight error and all non-e2e commands pass.
    Evidence: .sisyphus/evidence/task-7-verification-suite.txt

  Scenario: Dashboard e2e smoke
    Tool: Playwright
    Steps: Execute dashboard e2e spec covering auth redirect, create/save, table, detail, edit handoff, delete cancel, delete confirm.
    Expected: All dashboard e2e assertions pass with stable selectors.
    Evidence: .sisyphus/evidence/task-7-dashboard-e2e.txt
  ```

  **Commit**: YES | Message: `test(dashboard): cover tailadmin diagram management` | Files: [`tests/unit/*`, `tests/e2e/*`, `.sisyphus/evidence/*`, test config only if required]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [x] F1. Plan Compliance Audit — oracle
- [x] F2. Code Quality Review — unspecified-high
- [x] F3. Real Manual QA — unspecified-high (+ playwright)
- [x] F4. Scope Fidelity Check — deep

## Commit Strategy
- Commit per task where feasible using the messages listed above.
- Do not push unless the user explicitly requests it.
- Do not commit unrelated untracked artifacts such as `.agents/`, `skills/`, `skills-lock.json`, or `test-results/` unless explicitly requested and reviewed.
- Keep TailAdmin attribution/license obligations satisfied if copying substantial template snippets: retain MIT license notice in an appropriate source comment or docs note if needed.

## Success Criteria
- `/dashboard` exists as a separate authenticated management surface.
- Current `/` editor remains the canonical editing surface and still supports guest unsaved editing.
- Dashboard users can list, view/preview, open for edit, cancel delete, and permanently delete diagrams.
- UI is TailAdmin-inspired but native React/Next/Tailwind v4, without Alpine/Webpack/template build artifacts.
- All planned automated checks pass or documented local preflight constraints are recorded with non-blocked checks passing.
