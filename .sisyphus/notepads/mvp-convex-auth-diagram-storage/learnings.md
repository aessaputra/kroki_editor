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
