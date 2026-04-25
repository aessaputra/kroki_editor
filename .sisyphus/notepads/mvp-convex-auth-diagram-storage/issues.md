# Issues

## 2026-04-25 Task: session-start
- Convex CLI setup may require human interaction. If blocked, evidence must state exact user action needed and implementation should pause that specific task.
- Current repository has no test framework, no CI, and no `type-check` script.

## 2026-04-25 Task: foundation
- `npm run lint` still fails in pre-existing files outside this task scope (`src/components/AIGenerateModal.tsx`, `src/components/DiagramPreview.tsx`, `src/hooks/useDiagramEditor.ts`, and others); foundation changes did not introduce those errors.
- Convex MCP startup with `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor` exited 0 under a TTY wrapper, but did not print a deployment banner; later tasks should re-check project linkage if needed.
- The dependency install path is currently sensitive to the existing `nodemailer@7` vs `@auth/core@0.37.0` peer range and therefore used `--legacy-peer-deps`.

## 2026-04-25 Task: ai-owner-removal
- `npm run lint` still fails due to pre-existing React hook rule violations in `src/components/DiagramPreview.tsx` and `src/hooks/useDiagramEditor.ts`; this cleanup did not add new lint errors.
- `package-lock.json` still contains transitive `jose` and `nodemailer` entries through `@auth/core`, which is expected and should not be stripped in this task.

## 2026-04-25 Task: auth-provider-ui
- `npx @convex-dev/auth` could not be used because it requires a clean working tree; manual setup plus `CONVEX_AGENT_MODE=anonymous npx convex dev --once` was used instead.
- Playwright MCP still expects Chrome at `/opt/google/chrome/chrome`; bundled Chromium only worked through a direct Playwright script after `npx playwright install chromium` and `npx playwright install-deps chromium`.
- `npm run lint` remains red only for pre-existing `react-hooks/set-state-in-effect` errors in `src/components/DiagramPreview.tsx` and `src/hooks/useDiagramEditor.ts`; auth-provider-ui changes added no new lint errors.

## 2026-04-25 Task: auth-provider-ui
- Atlas QA caught that form visibility was not enough: `/api/auth` must be covered by a real signup/logout browser smoke.
- The local anonymous Convex deployment needs `JWT_PRIVATE_KEY` and `JWKS` set outside git; do not commit generated key material to `.env.local.example` or evidence.
- `NEXT_PUBLIC_CONVEX_SITE_URL=` belongs in `.env.local.example` as a placeholder because `convex dev` writes it during local setup.

## 2026-04-25 Task: convex-diagrams
- `CONVEX_AGENT_MODE=anonymous npx convex dev --once` was blocked because a local backend is already running on port 3210; `npx convex codegen` was used instead and completed successfully.
- Convex MCP startup command `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor` completed with no stdout/stderr output, so evidence records command completion but no deployment/banner details.

## 2026-04-25 Task: convex-storage-service
- Playwright MCP could not run because Chrome was missing at `/opt/google/chrome/chrome`; browser evidence used the installed Playwright Chromium package instead.
- `npm run lint` remains red on the known pre-existing `react-hooks/set-state-in-effect` errors in `src/components/DiagramPreview.tsx` and `src/hooks/useDiagramEditor.ts`; this task did not change those files.

## 2026-04-25 Task: auth-gated-diagram-ui
- Playwright MCP still cannot launch Chrome at `/opt/google/chrome/chrome`; Task 6 browser evidence used the installed Playwright Chromium package after attempting the MCP path.
- `npm run lint` remains red only for pre-existing errors in `src/components/DiagramPreview.tsx` and `src/hooks/useDiagramEditor.ts`; a new sidebar `set-state-in-effect` lint issue was removed during Task 6.

## 2026-04-25 Task: mvp-test-coverage
- A raw `/AI/i` rendered-text absence assertion is too broad because it matches the `ai` in ordinary words like `Diagram`; use removed UI phrases such as `Generate with AI` and `AnythingLLM` instead.
- Convex MCP startup command again completed with no stdout/stderr output, so evidence records command completion but no deployment/banner details.
