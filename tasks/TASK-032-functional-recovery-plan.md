# TASK-032: Functional Recovery Plan (Post-Interruption)

## Status

Historical only. This task reflected the repo state on March 5, 2026 and is no longer an accurate description of the current branch.

As of March 8, 2026:
- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm test` passes
- `pnpm test:e2e` passes
- `pnpm db:migrate:status` passes
- TASK-028, TASK-029, TASK-030, TASK-031, and TASK-033 are implemented on the current branch

Use `docs/product/backlog.md`, `docs/runbooks/local-dev.md`, and `docs/runbooks/deploy.md` as the current source of truth for planning and execution. Do not use this file to infer active breakages or remaining work.

## Goal
Restore a fully functional app from the current in-between state while preserving compliance-critical behavior:
- no over-outtake
- locked transactions immutable unless explicitly unlocked
- product uniqueness (`productName + productCategory + lotNumber`)

## Current State Snapshot (2026-03-05)

Work from TASK-029, TASK-030, and TASK-031 is partially integrated.

What is already in place:
- Role helper and tests added (`apps/web/src/server/roles.ts`, `roles.test.ts`)
- Mutation routes now enforce `operator` role and pass `actorUserId`
- `actorUserId` fields added to intake/outtake server logic and Prisma schema
- Admin user management API/UI scaffolded (`/api/admin/users*`, `/admin/users`)
- Login flow updated to reject inactive users
- Branding updates applied (Organizize + new header/login styling)

What is currently broken (verified by commands):
- `pnpm typecheck` fails:
  - `apps/web/app/api/outtake/route.ts`
  - `apps/web/app/api/outtake/[id]/route.ts`
  - cause: spreading `unknown` payload into object
- `pnpm lint` fails in new/changed files (format/import/a11y/type diagnostics)
- `pnpm test` fails in default env because `SESSION_SECRET` is missing during `auth.test.ts`
- `pnpm test:e2e` fails due schema drift:
  - missing `actorUserId` column in transaction tables
  - missing `active` column in `User` table
- Local DB is behind migrations (`packages/db/prisma/dev.db` has only first 2 migrations applied)

## Recovery Steps (Do In Order)

1. Create a recovery branch and keep scope tight
- Branch: `task/TASK-032-functional-recovery`
- Keep changes inside:
  - `apps/web`
  - `packages/db/prisma`
  - `docs/runbooks` (only if command expectations change)

2. Align database schema with current code
- Apply pending migrations to local dev DB.
- Regenerate Prisma client.
- Verify columns exist in both `IntakeTransaction`/`OuttakeTransaction` (`actorUserId`) and `User` (`active`).
- Required commands:
  - `pnpm --filter @inventory/db db:migrate:deploy`
  - `pnpm --filter @inventory/db db:generate`

3. Fix compile blockers in API routes
- In outtake create/update routes, narrow/cast parsed payload to object before spreading.
- Mirror the intake route pattern that already typechecks.
- Files:
  - `apps/web/app/api/outtake/route.ts`
  - `apps/web/app/api/outtake/[id]/route.ts`

4. Make admin API error handling deterministic (avoid 500 for bad input)
- Replace `throw new Error(...)` with `ApiError("INVALID_PAYLOAD", 400, ...)` where validation fails.
- Ensure invalid role values return `400`, not `500`.
- Files:
  - `apps/web/app/api/admin/users/route.ts`
  - `apps/web/app/api/admin/users/[id]/route.ts`

5. Stabilize e2e schema bootstrap
- Update `ensureSchema()` in e2e test to include/ensure all new columns:
  - `IntakeTransaction.actorUserId`
  - `OuttakeTransaction.actorUserId`
  - `User.active`
- Important: existing `CREATE TABLE IF NOT EXISTS` is not enough when DB already exists; add idempotent `ALTER TABLE ... ADD COLUMN` guards or reset strategy for the e2e DB.
- File:
  - `apps/web/tests/e2e/smoke.e2e.test.ts`

6. Make test environment reproducible for auth tests
- Ensure `SESSION_SECRET` is available for unit tests by default (test setup file or test script env injection).
- Keep production behavior unchanged (still fail fast when truly missing at runtime).
- Candidate locations:
  - `apps/web/package.json` test script
  - or a dedicated test setup file loaded by Vitest

7. Resolve lint/format issues introduced by partial work
- Fix all diagnostics in new admin files and modified API/CSS files.
- Include a11y button `type` fixes and remove non-null assertions in admin UI where possible.

8. Re-run full quality gates and capture evidence
- Run from repo root:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm db:migrate:status`
- Capture a short pass/fail summary for each command.

9. Run focused compliance regression checks before merge
- Verify outtake guardrail still blocks exceeding units on hand.
- Verify locked transactions cannot be edited unless unlocked first.
- Verify product uniqueness conflict still returns expected error.
- Verify viewer role cannot hit mutation routes and admin-only user management stays admin-only.

## Definition of Done
- All quality gates pass from repo root.
- New RBAC/admin features work as intended.
- No regression in inventory, lock/unlock, or uniqueness invariants.
- Recovery changes are documented with command evidence and risk notes.
