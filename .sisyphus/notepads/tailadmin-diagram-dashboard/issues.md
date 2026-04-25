# Issues: TailAdmin Diagram Dashboard

- Initial browser verification was blocked because Chrome was not installed for Playwright; resolved by installing Google Chrome via `npx playwright install chrome`.
- Browser console reported a non-blocking Kroki 400 fetch error during preview rendering, but it did not affect the dashboard redirect or guest editor checks.
- Invalid `diagramId` values currently bubble up the Convex validator text into the inline status/toast path; this is deterministic and non-blocking, but the message is technical rather than user-friendly.
- Task 2 verification found no new implementation blockers; the only browser interruption was the existing editor `beforeunload` guard when navigating away from `/` after signup.
- Task 3 verification found no new blockers; lint still reports pre-existing warnings in generated Convex files, existing `<img>` usage, and `src/types/options.ts`, but no lint errors remain.
- Task 4 verification found no new unresolved blockers. `npm run lint` still reports the same pre-existing warnings in generated Convex files, existing `<img>` usage, and `src/types/options.ts`; the new dashboard detail/table code has zero lint errors.
- During Task 4 Playwright verification, an initial broad `getByText(/loaded|loading/)` assertion hit strict-mode ambiguity because the page status, loading UI, and toast all matched; re-running with `data-testid="diagram-load-state"` produced deterministic pass evidence.
- Task 5 verification found no new blockers. `npm run lint` still reports 8 pre-existing warnings only: unused eslint-disable directives in `convex/_generated/api.js`, `convex/_generated/dataModel.d.ts`, `convex/_generated/server.d.ts`, and `convex/_generated/server.js`; existing `<img>` warnings in `src/components/DiagramTypeSelector.tsx`, `src/components/FormatSelector.tsx`, and `src/components/HomePageClient.tsx`; and the existing unused `diagramType` warning in `src/types/options.ts`.
- Task 5 `npm run build` passed. Next.js emitted the existing dependency freshness notice that `baseline-browser-mapping` data is over two months old and suggests `npm i baseline-browser-mapping@latest -D`; no build errors were produced.

- Task 6 verification found no new blockers. `npm run lint` still reports the same 8 pre-existing warnings: unused eslint-disable directives in Convex generated files, existing `<img>` warnings in selector/root components, and the existing unused `diagramType` warning in `src/types/options.ts`.
- Task 6 `npm run build` passed with the existing `baseline-browser-mapping` freshness notice only; no build errors were produced.
- Task 6 Playwright modal QA observed the confirm button as disabled immediately after activation, but the Convex delete completed fast enough that `aria-busy` was already detached by the sampling step.

- Task 6 retry resolved Atlas' dashboard table visual overlap for Updated/Created timestamps. `npm run type-check` passed and `npm run lint` still reports only the same 8 pre-existing warnings.
- Task 7 Playwright initially failed because the login redirect keeps `next=/dashboard` unencoded and the edit handoff needs an awaited URL predicate; both were corrected in the test assertions, not the app.
