# Decisions: TailAdmin Diagram Dashboard

- Dashboard is a separate `/dashboard` route.
- Delete is permanent after explicit confirmation.
- Dashboard preview/detail is read-only; Edit opens existing `/` editor through `/?diagramId=<id>`.
- Adapt selected TailAdmin components only; do not import Alpine.js/Webpack pipeline.
