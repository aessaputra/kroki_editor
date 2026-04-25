# Learnings: TailAdmin Diagram Dashboard

## 2026-04-25 Task: exploration synthesis
- Root editor state lives in `src/app/page.tsx` using `useDiagramEditor`; `handleLoadDiagram(diagram: SavedDiagram)` already sets type, output format, options, source, currentSavedDiagramId, snapshot, and dirty state.
- `useSavedDiagrams.ts` exposes `loadDiagram(id)`, `deleteDiagram(id)`, `renameDiagram`, and list data; client `SavedDiagram.id` is a string while Convex uses `Id<'diagrams'>` with a local cast helper.
- Existing unauthenticated save redirects with `router.push('/login')`; dashboard should redirect to `/login?next=/dashboard` while `/` must remain guest-editable without `diagramId`.
- `DiagramPreview.tsx` is reusable and already handles empty/loading/error/success preview states.
- Existing E2E patterns use `page.getByTestId(...)`, unique signup credentials, Convex preflight, and dialog handling in `tests/e2e/mvp-smoke.spec.ts`.
- TailAdmin linked repo is HTML + Alpine.js + Tailwind v4 + Webpack; extract static visual structure only and convert interactive `x-data/@click/:class` behavior to React state/hooks.
- Tailwind v4 is CSS-first through `src/app/globals.css`; use existing `.btn-*`, `.card`, `.card-elevated`, `.input`, `.badge`, `.badge-accent` utilities rather than adding a Tailwind config.
- Root `/` now uses a Suspense-wrapped client component so `useSearchParams()` can safely drive `diagramId` loading without forcing a full app redesign.
- Saved diagram loading from `/?diagramId=<id>` works through the existing `loadDiagram(id)` hook, and the loaded state is surfaced with a non-blocking inline status plus toast.
- `/dashboard` should redirect signed-out users to `/login?next=/dashboard`; the login page now preserves `next` on successful sign-in.
- Login return intent is now restricted to same-app paths only: exactly one leading `/`, no protocol-relative `//`, and external URLs fall back to `/`.
- Task 2 dashboard shell lives in `src/components/dashboard/` and keeps `/dashboard` as a client-protected route; authenticated content renders `DashboardShell` while signed-out users still redirect to `/login?next=/dashboard`.
- Dashboard shell uses existing Tailwind v4 CSS-first tokens/utilities (`bg-surface-alt`, `bg-surface`, `text-text-*`, `border-border`, `.btn-*`, `.card`, `.card-elevated`, `.badge`, `.badge-accent`) rather than adding TailAdmin config or assets.
- Mobile dashboard navigation is React state-driven: the sidebar is off-canvas at 375px (`-288px` to `0`) and content remains reachable at full viewport width.
- Task 3 dashboard table is client-side under `src/components/dashboard/DashboardDiagramTable.tsx`; it reuses `useSavedDiagrams()` for `diagrams`/`isLoading`, uses an error boundary for a non-sensitive `diagram-table-error` fallback, and keeps View selection as local component state only.
- Task 3 date display uses a deterministic UTC helper (`YYYY-MM-DD HH:mm UTC`) so dashboard tests can assert date presence without depending on locale formatting.
- Edit/Delete dashboard row actions are intentionally disabled placeholders for later tasks while still exposing stable `edit-diagram-button` and `delete-diagram-button` test IDs.
- Task 4 dashboard detail lives in `src/components/dashboard/DashboardDiagramDetail.tsx`; it reuses `useSavedDiagrams()` list data from `DashboardDiagramTableSection`, defaults selection to the first loaded diagram through derived state, and keeps source read-only with `<pre><code>` rather than Monaco.
- Task 4 preview generation uses `buildKrokiUrl(diagram.diagramType, diagram.source, diagram.outputFormat, diagram.options)` and wraps the existing `DiagramPreview` in `data-testid="diagram-preview"`; image-format previews get a non-blocking `Image` validation fallback that can render `data-testid="diagram-preview-error"` without breaking the shell.
- The deterministic UTC timestamp helper moved to `src/components/dashboard/dashboardFormat.ts` so both the table and detail can share it without a circular import.
- Dashboard Edit now reuses the existing root editor deep-link contract by navigating to `/?diagramId=<id>`; Playwright verified the root editor load state reaches `loaded` for the selected saved diagram.
- Task 5 dashboard delete is handled locally in `DashboardDiagramTableSection`: row Delete opens `DashboardDeleteConfirmModal`, confirm calls the existing `useSavedDiagrams().deleteDiagram(id)`, and rows are hidden only after the Convex mutation succeeds.
- Task 5 selection safety uses the current visible diagram list to move detail selection to the next remaining diagram when the selected row is deleted; deleting the final diagram falls through to the existing `empty-diagrams-state`.
- Task 5 Playwright QA signed up a fresh user, saved one diagram, verified cancel preserves row count and detail text, then confirmed delete removes the row and shows the empty state; evidence screenshots are `.sisyphus/evidence/task-5-delete-cancel.png` and `.sisyphus/evidence/task-5-delete-confirm.png`.

## 2026-04-25 Task 6 navigation/responsive/a11y
- Root editor signed-in navigation now lives in `HomePageClient` via `data-testid="dashboard-navigation-link"`; `/` stays guest-capable and `src/app/page.tsx` remains the Suspense wrapper around the client editor.
- Dashboard navigation remains limited to real destinations: the header exposes `dashboard-open-editor-link`, the sidebar exposes `dashboard-sidebar-editor-link`, and no profile/settings/team links were added.
- `DashboardDiagramTable` passes the triggering delete button into `DashboardDeleteConfirmModal`; row-level keyboard selection now ignores bubbled key events so row action buttons can be opened by keyboard.
- Narrow dashboard table behavior is contained inside the table card with internal horizontal scroll, while detail/source/preview containers use `min-w-0`, wrapped source text, and preview overflow to avoid document-level horizontal overflow at 375px.
- Playwright QA evidence for this task is recorded in `.sisyphus/evidence/task-6-navigation.txt` and `.sisyphus/evidence/task-6-modal-keyboard.txt`.

## 2026-04-25 Task 6 retry: date column overlap
- Atlas visual QA found the dashboard Updated/Created timestamps could read as concatenated (`UTC2026...`) because the fixed table min-width was smaller than the intended column budget and date cells used no-wrap text.
- The minimal table fix keeps the internal horizontal scroller, raises the table min-width to `64rem`, gives Updated/Created `w-48` columns, and allows timestamp cells to wrap normally instead of spilling into adjacent columns.
- Retry Playwright evidence is `.sisyphus/evidence/task-6-date-columns.txt` with screenshot `.sisyphus/evidence/task-6-date-columns.png`; 375px document/body scroll width stayed constrained to 375px with row actions reachable after internal scroll.
- Task 7 dashboard e2e coverage confirmed the login redirect preserves `next=/dashboard` as a raw same-app path, not an encoded value.
- Task 7 edit handoff is best asserted with `page.waitForURL(...)` on `/?diagramId=<id>` because the navigation is async even though the route updates immediately after the click.
- Task 7 added a meaningful UTC formatting unit test for `formatDiagramTimestamp`, which keeps the dashboard date assertions deterministic.

## 2026-04-25 Final Verification Wave
- F1 Plan Compliance, F2 Code Quality, F3 Manual QA, and F4 Scope Fidelity all returned APPROVE; final wave checkboxes were marked complete after the continuation directive explicitly instructed completion.
