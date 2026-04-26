# Draft: Convex Cloud Development

## Requirements (confirmed)
- User wants to know how to run this project with Convex Cloud through `https://dashboard.convex.dev/`.
- User explicitly requested `@librarian` research.
- User provided Convex Cloud URL: `https://oceanic-mouse-735.eu-west-1.convex.cloud`.
- User provided Convex HTTP Actions URL: `https://oceanic-mouse-735.eu-west-1.convex.site`.
- User hit Convex CLI error: `A local backend is still running on port 3210. Please stop it and run this command again.`
- User asked to stop the local Convex backend process.

## Technical Decisions
- Research first; do not change project files yet.
- Treat this as setup guidance/work planning for Convex Cloud, not local Convex.
- `.env.local` currently points to local Convex URLs and should be changed only during execution, not by Prometheus.

## Research Findings
- Librarian research task `bg_2587f255` completed.
- Official workflow: `npx convex dev` prompts login/project configuration and syncs to Convex Cloud dev deployment.
- Cloud vs local decision: use `npx convex dev`; do not use `npx convex dev --local` for dashboard/cloud workflow.
- For Next.js, `.env.local` should contain `NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud` and `CONVEX_DEPLOYMENT=...`.
- Dashboard model: project has production deployment plus personal/team development deployments; `npx convex dev` targets dev, `npx convex deploy` targets production.
- Commit Convex source and generated API files; ignore `.env.local`, local secrets, and `.convex/` if local deployments were used.
- Tailscale pitfall: frontend can run at `http://<tailscale-ip>:43017` while Convex remains cloud; ensure env URL is not localhost and restart Next after env changes.
- Current README already documents `npx convex dev` and `npm run dev` in separate terminals.
- Current README lists relevant env vars: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `CONVEX_DEPLOYMENT`.
- Current `.env.local` has `NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210` and `NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:3211`, confirming it is currently local Convex configuration.
- Port `3210` is the local Convex backend port; cloud `npx convex dev` refuses to proceed while local backend is still running.
- After cloud switch, user saw Convex Auth `InvalidAccountId` from Password provider at `retrieveAccount`, which means the submitted flow is `signIn` and no `authAccounts` row exists for that email/provider in the current cloud deployment.
- Accounts created in local Convex do not exist in Convex Cloud; users must use the Sign up flow again or seed/migrate auth tables intentionally.

## Open Questions
- Should the plan only document the commands, or should it also update README/env examples after confirmation?
- What exact `CONVEX_DEPLOYMENT` value should be used for `oceanic-mouse-735`? It is usually managed/written by `npx convex dev` and may look like `dev:<name>` or another deployment identifier.
- Should executor stop the local Convex process automatically, or should user stop the terminal/process manually?

## Scope Boundaries
- INCLUDE: Convex Cloud dashboard workflow, CLI login/linking, env vars, local Next.js over Tailscale with cloud backend.
- EXCLUDE: Convex local mode (`npx convex dev --local`) unless used only for contrast.
- EXCLUDE: implementing code or modifying non-plan/draft files in Prometheus mode.
- EXCLUDE: Prometheus directly killing processes; execution should be done by Sisyphus via `/start-work` or by user commands.
