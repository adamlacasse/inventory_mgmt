# TASK-022: Seed Data and Local Demo Bootstrap

## Context

The current seed file is a scaffold log statement, and DB status checks fail without explicit environment setup. MVP handoff requires predictable local bootstrap with demo data.

## Scope

- In scope:
  - Implement functional seed script with representative products, intake, and outtake records.
  - Update runbook/env guidance for `DATABASE_URL` and bootstrap commands.
  - Ensure seeded dataset demonstrates non-zero inventory and history records.
- Out of scope:
  - Production deployment automation.
  - External migration/import tooling.

## Files To Touch

- `packages/db/src/seed.ts`
- `docs/runbooks/local-dev.md`
- `apps/web/.env.example`

## Acceptance Criteria

1. `pnpm --filter @inventory/db db:seed` creates demo-ready records without manual DB edits.
2. Seeded data includes at least 4 products across multiple categories/lots.
3. Seeded transactions include both intake and outtake history with valid relational links.
4. Local setup docs clearly define `DATABASE_URL` and end-to-end bootstrap steps.
5. `pnpm db:migrate:status` and seed command succeed with documented local environment setup.

## Test Plan

- Unit:
  - N/A unless seed helper functions are introduced.
- Integration:
  - Run migrate status + seed + inventory snapshot query validation.
- E2E:
  - Use seeded dataset for smoke workflow execution.

## Risk Assessment

- Functional risk: Medium.
- Data risk: Medium.
- Compliance risk: Medium (demo environment quality affects validation confidence).

## Rollback Plan

Revert seed and docs changes; restore previous scaffold seed behavior.
