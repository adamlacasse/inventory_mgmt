# TASK-029: Role-Based Authorization and Audit Attribution

## Context

After baseline authentication is in place, operators and admins need distinct permissions to prevent unauthorized edits while preserving an accountable audit trail per user.

## Scope

- In scope:
  - Add role-based authorization checks on protected API routes.
  - Define minimum roles for MVP+ (`admin`, `operator`, `viewer`) and enforce route-level permissions.
  - Persist user attribution metadata on inventory-affecting transactions and lock/unlock actions.
  - Return deterministic `403` responses for authenticated users lacking permission.
  - Add tests for allowed/denied role behavior and audit attribution persistence.
- Out of scope:
  - Organization/tenant-level permission models.
  - Custom role builders or policy UI.
  - External IAM sync.

## Files To Touch

- `apps/web/app/api/*` (authorization guard integration)
- `apps/web/src/server/*` (role policy + auth context utilities)
- `packages/db/prisma/schema.prisma` (audit attribution fields if required)
- `packages/db/prisma/migrations/*`
- `docs/runbooks/local-dev.md`
- `docs/runbooks/deploy.md`
- `apps/web/tests/*` (authorization and audit metadata tests)

## Acceptance Criteria

1. API routes enforce minimum role requirements with deterministic `403` for insufficient permissions.
2. `viewer` cannot execute mutation routes for products/intake/outtake/lock-unlock.
3. `operator` can execute standard inventory workflows but cannot perform admin-only actions.
4. `admin` can perform all protected actions.
5. Inventory-affecting writes and lock/unlock events store user attribution metadata (at minimum `actorUserId`).
6. Existing compliance-critical invariants remain unchanged:
   - no over-outtake
   - locked transactions immutable without explicit unlock
   - product uniqueness (`name + category + lot`) preserved

## Test Plan

- Unit:
  - Add role-policy tests for allow/deny matrices.
- Integration:
  - Add API route tests for `403` denied and `2xx` allowed behavior by role.
  - Add persistence tests validating `actorUserId` attribution on transaction and lock/unlock writes.
- E2E:
  - Extend smoke flow with at least one denied action path and one permitted admin path.

## Risk Assessment

- Functional risk: High (authorization guards across core routes).
- Data risk: Medium (schema changes for attribution metadata).
- Compliance risk: High (improper permissions can allow unauthorized inventory mutations).

## Rollback Plan

Revert authorization guard and schema changes, then apply rollback migration for attribution fields if needed. Re-run quality gates and compliance smoke checks before reopening protected routes.
