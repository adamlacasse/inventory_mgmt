# TASK-011: Intake API Save and Lock Flow

## Context

Domain intake creation exists, but no API route currently executes the full draft-to-saved behavior needed by operators. MVP requires a clear save flow that locks transactions after save.

## Scope

- In scope:
  - Add intake API routes for create and update.
  - Support intake payload fields: `date`, optional `notes`, and line items.
  - Resolve/create product identities for intake line items.
  - Enforce save/lock behavior on finalized intake transactions.
  - Add route tests for happy path and validation failures.
- Out of scope:
  - Intake UI implementation.
  - CSV reporting.

## Files To Touch

- `apps/web/app/api/intake/*`
- `apps/web/src/*` (intake API helpers/types)
- `apps/web/tests/*` (intake route tests)
- `packages/domain/src/modules/intake/*` (only if save-state contract updates are required)

## Acceptance Criteria

1. `POST /api/intake` accepts valid intake payload and persists transaction plus items.
2. Invalid payloads (empty line items, missing product identity fields, non-positive units) return explicit errors.
3. Intake save operation sets transaction lock state to locked when finalized.
4. Mutation attempts against locked intake transactions are rejected until unlock flow is executed.
5. Route tests verify success, validation errors, and locked mutation rejection.

## Test Plan

- Unit:
  - Add tests for intake API payload mapping and error serialization.
- Integration:
  - Add route tests for create/save and locked-update rejection.
- E2E:
  - N/A (full workflow validated in smoke suite task).

## Risk Assessment

- Functional risk: High.
- Data risk: High (intake writes directly affect inventory).
- Compliance risk: High (saved transaction locking is compliance-critical).

## Rollback Plan

Revert intake API route files and related domain contract updates; rerun domain tests to confirm baseline behavior.
