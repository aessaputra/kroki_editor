# Issues

## 2026-04-25 Task: session-start
- Convex CLI setup may require human interaction. If blocked, evidence must state exact user action needed and implementation should pause that specific task.
- Current repository has no test framework, no CI, and no `type-check` script.

## 2026-04-25 Task: foundation
- `npm run lint` still fails in pre-existing files outside this task scope (`src/components/AIGenerateModal.tsx`, `src/components/DiagramPreview.tsx`, `src/hooks/useDiagramEditor.ts`, and others); foundation changes did not introduce those errors.
- Convex MCP startup with `npx -y convex@latest mcp start --project-dir /home/coder/dev/kroki_editor` exited 0 under a TTY wrapper, but did not print a deployment banner; later tasks should re-check project linkage if needed.
- The dependency install path is currently sensitive to the existing `nodemailer@7` vs `@auth/core@0.37.0` peer range and therefore used `--legacy-peer-deps`.
