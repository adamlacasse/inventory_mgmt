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
- [ ] `SESSION_SECRET` is set in deployment environment (minimum 32 characters, generated with `openssl rand -hex 32`)
- [ ] Seed users have non-default passwords in production
- [ ] Demo smoke flow completed

## Go / No-Go Gates

Proceed only when all are true:

- [ ] Outtake cannot exceed units on hand.
- [ ] Locked transactions are immutable until explicit unlock.
- [ ] Product uniqueness (`productName + productCategory + lotNumber`) is preserved.
- [ ] All protected UI routes redirect to `/login` when accessed without a session.
- [ ] All mutation API routes return `401` for unauthenticated requests.
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

## Database Deploy Commands (Vercel Environments)

Run from repo root as a one-off job (local terminal or CI), not from a request handler.

1. Pull target env vars from Vercel:
  ```bash
  # Use "preview" or "production"
  vercel env pull .env.vercel --environment=preview
  ```
2. Apply pending migrations to the target DB:
  ```bash
  set -a
  source .env.vercel
  set +a
  pnpm db:migrate:deploy
  ```
3. (Optional) Seed the target DB:
  ```bash
  set -a
  source .env.vercel
  set +a
  BOOTSTRAP_ADMIN_EMAIL='admin@your-domain.com' \
  BOOTSTRAP_ADMIN_PASSWORD='<strong-admin-password>' \
  BOOTSTRAP_ADMIN_NAME='Inventory Admin' \
  BOOTSTRAP_OPERATOR_EMAIL='operator@your-domain.com' \
  BOOTSTRAP_OPERATOR_PASSWORD='<strong-operator-password>' \
  BOOTSTRAP_OPERATOR_NAME='Inventory Operator' \
  pnpm --filter @inventory/db db:seed:upsert
  ```
4. (Optional, demo reset only) Load full demo dataset:
  ```bash
  set -a
  source .env.vercel
  set +a
  pnpm --filter @inventory/db db:seed
  ```

Seed guidance:
- `db:seed:upsert` is non-destructive and only upserts bootstrap users by email.
- `db:seed` clears core tables before inserting demo data. Do not run in production unless a reset is explicitly intended.

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
  For existing DBs after initial bootstrap, use `pnpm db:migrate:deploy` for incremental migrations.
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
  SESSION_SECRET=<minimum-32-char-random-string-from-openssl-rand-hex-32>
  ```
5. Deploy and run Post-Deploy Smoke checks.

## Migration and Environment Notes

- Ensure `DATABASE_URL` is set to the target environment and points to the intended database before any migration or build steps.
- Confirm that any schema changes are backward-compatible with the previous release unless the rollout plan explicitly includes coordinated downtime.
- If using SQLite for dev/demo, do not reuse production data in a local environment.

## Post-Deploy Smoke

0. Verify that navigating to `/products` without a session redirects to `/login`.
1. Log in at `/login`.
2. Create product at `/products`.
3. Save intake at `/intake`.
4. Save outtake at `/outtake`.
5. Confirm `/inventory` reflects net units.
6. Confirm `/history` lock/unlock controls work.
7. Download `/api/reports/inventory` CSV.
8. Click "Sign Out" — confirm redirect to `/login`.

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
