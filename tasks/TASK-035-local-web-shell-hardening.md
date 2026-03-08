# TASK-035: Local Web Shell Hardening

## Context

Local development currently emits avoidable browser noise from a missing favicon request and from Vercel Speed Insights loading outside deployed Vercel environments.

## Scope

- In scope:
  - Add a web app favicon asset so local page loads do not return a favicon 404.
  - Prevent Vercel Speed Insights from rendering in local development.
  - Keep all inventory, locking, and validation behavior unchanged.
- Out of scope:
  - Any transaction, inventory, auth, API, or database behavior changes.
  - Broader observability or analytics changes beyond the existing Vercel call.

## Files To Touch

- `tasks/TASK-035-local-web-shell-hardening.md`
- `apps/web/app/layout.tsx`
- `apps/web/app/icon.svg`
- `apps/web/app/favicon.ico/route.ts`
- `apps/web/src/server/observability.ts`
- `apps/web/src/server/observability.test.ts`
- `apps/web/src/app/favicon-route.test.ts`

## Acceptance Criteria

1. Local page loads no longer return a favicon 404.
2. Vercel Speed Insights is rendered only in deployed Vercel preview or production environments.
3. No inventory, locking, or validation behavior changes.

## Test Plan

- Unit:
  - Add tests for the Speed Insights environment gate.
  - Add a test for the favicon redirect route.
- Integration:
  - Run the `apps/web` test suite, lint, and typecheck.
- E2E:
  - N/A for this shell-only fix.

## Risk Assessment

- Functional risk: Low.
- Data risk: None.
- Compliance risk: None.

## Rollback Plan

Revert the web shell files in this task and restore unconditional `SpeedInsights` rendering if needed.
