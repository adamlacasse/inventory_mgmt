# Deploy Runbook

## Environments

- `dev`
- `staging`
- `production`

## Pre-Deploy Checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e` passes
- [ ] `pnpm db:migrate:status` passes
- [ ] Demo smoke flow completed

## Go / No-Go Gates

Proceed only when all are true:

- [ ] Outtake cannot exceed units on hand.
- [ ] Locked transactions are immutable until explicit unlock.
- [ ] Product uniqueness (`productName + productCategory + lotNumber`) is preserved.
- [ ] Tests for changed behavior exist and are passing.

## Release Steps (Command Sequence)

```bash
pnpm install
pnpm --filter @inventory/db db:generate
pnpm --filter @inventory/db db:migrate:status
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Deploy using platform-specific workflow after all checks pass.

## Vercel + Turso (Recommended MVP Hosting)

1. Provision Turso DB:
  ```bash
  turso auth login
  turso db create inventory-mvp
  turso db show inventory-mvp --url
  turso db tokens create inventory-mvp
  ```
2. Create the schema SQL and apply it with the Turso CLI:
  ```bash
  pnpm --filter @inventory/db db:turso:bootstrap
  turso db shell inventory-mvp < /tmp/inventory-mvp.sql
  ```
3. Configure Vercel project:
  ```text
  Root directory: apps/web
  Install command: pnpm install
  Build command: pnpm --filter @inventory/db db:generate && pnpm --filter @inventory/web build
  ```
4. Set Vercel environment variables (Preview + Production):
  ```text
  DATABASE_URL=libsql://<db-host>
  DATABASE_AUTH_TOKEN=<token>
  ```
5. Deploy and run Post-Deploy Smoke checks.

## Migration and Environment Notes

- Ensure `DATABASE_URL` is set to the target environment and points to the intended database before any migration or build steps.
- Confirm that any schema changes are backward-compatible with the previous release unless the rollout plan explicitly includes coordinated downtime.
- If using SQLite for dev/demo, do not reuse production data in a local environment.

## Post-Deploy Smoke

1. Create product at `/products`.
2. Save intake at `/intake`.
3. Save outtake at `/outtake`.
4. Confirm `/inventory` reflects net units.
5. Confirm `/history` lock/unlock controls work.
6. Download `/api/reports/inventory` CSV.

## Rollback Plan

1. Roll back app version to previous release.
2. If schema changes were introduced, decide on DB rollback.
3. If migrations are backward-compatible, keep DB as-is and roll back only the app.
4. If migrations are not backward-compatible, run the documented DB rollback steps for the specific migration before re-enabling traffic.
5. Run post-rollback smoke checks (`/inventory`, `/history`, CSV export).
6. Capture incident notes and block re-release until root cause is resolved.

## Incident Triage (Critical Inventory/Locking)

1. Identify the first failing step from Post-Deploy Smoke.
2. Verify guardrails: outtake cannot exceed units on hand.
3. Verify guardrails: locked transactions are immutable without explicit unlock.
4. Verify guardrails: product uniqueness is preserved.
5. If any guardrail fails, stop further deploys and roll back app version.
6. Notify the on-call/lead with the failing step, environment, and repro notes.
