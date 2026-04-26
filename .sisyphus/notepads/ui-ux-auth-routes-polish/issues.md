# Issues

## 2026-04-25 Task: auth-route-refactor-verification
- Hands-on Playwright browser launch is blocked in this environment because Chromium cannot load `libnspr4.so`.
- Project E2E specs are additionally blocked by `tests/e2e/convexPreflight.ts` while `.env.local` points at remote Convex (`https://oceanic-mouse-735.eu-west-1.convex.cloud`) instead of local Convex.
- `playwright.config.ts` still points at port `3000`; Task 5 is responsible for aligning it to `43017`.

## 2026-04-25 Task: sidebar-register-fallback-review
- `src/components/dashboard/DashboardDiagramTable.tsx` still contains copy saying `use the manual Save button`; this is outside Task 4 scope but should be cleaned in Task 5 because the editor Save button is now removed.

## 2026-04-25 Task: focused-ui-polish-route-cta-e2e
- Targeted Playwright command is blocked by `tests/e2e/convexPreflight.ts` because `NEXT_PUBLIC_CONVEX_URL` points at remote Convex (`https://oceanic-mouse-735.eu-west-1.convex.cloud`) instead of local Convex; no E2E pass claimed.
- Browser QA through the Playwright MCP is blocked before navigation because Chrome is missing at `/opt/google/chrome/chrome`; evidence recorded in `.sisyphus/evidence/task-5-mobile-guest-register.txt`.
- `npm run lint` exits 0 but still reports the existing generated Convex unused-disable warnings, existing `<img>` warnings, and an existing unused `diagramType` warning in `src/types/options.ts`.
