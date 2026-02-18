# TASK-026: Vercel MVP Deploy with Shared DB

## Context

We need a low-cost hosting path for the MVP that supports Next.js API routes and a persistent shared database so the prototype can be shown to clients without local setup.

## Scope

- In scope:
  - Add runtime support for a hosted SQLite-compatible database.
  - Document Vercel deployment steps and required environment variables.
  - Document shared database provisioning steps.
- Out of scope:
  - Authentication or access control.
  - Multi-tenant or production hardening.

## Files To Touch

- `apps/web/src/server/prisma.ts`
- `apps/web/package.json`
- `apps/web/.env.example`
- `docs/runbooks/deploy.md`

## Acceptance Criteria

1. App can connect to a hosted database via environment variables in Vercel.
2. Deploy runbook includes concrete Vercel setup steps and shared DB provisioning.
3. Local dev remains unchanged with file-based SQLite.

## Test Plan

- Unit:
  - N/A (config changes only).
- Integration:
  - Deploy to Vercel and run the post-deploy smoke steps.
- E2E:
  - N/A (no behavior changes).

## Risk Assessment

- Functional risk: Low.
- Data risk: Medium (shared DB configuration mistakes can break persistence).
- Compliance risk: Medium (public demo without auth).

## Rollback Plan

Remove hosted DB configuration and revert to local-only demo flow. Revert runbook changes if inaccurate.
