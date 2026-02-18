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
- [ ] API and UI tests exist and are passing for changed behavior.

## Release Steps

```bash
pnpm install
pnpm --filter @inventory/db db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm db:migrate:status
pnpm build
```

Deploy using platform-specific workflow after all checks pass.

## Post-Deploy Smoke

1. Create product at `/products`.
2. Save intake at `/intake`.
3. Save outtake at `/outtake`.
4. Confirm `/inventory` reflects net units.
5. Confirm `/history` lock/unlock controls work.
6. Download `/api/reports/inventory` CSV.

## Rollback Plan

1. Roll back app version to previous release.
2. If schema changes were introduced, validate backward compatibility before DB rollback.
3. Run post-rollback smoke checks (`/inventory`, `/history`, CSV export).
4. Capture incident notes and block re-release until root cause is resolved.
