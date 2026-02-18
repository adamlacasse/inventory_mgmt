# TASK-013: Transaction Lock/Unlock and Mutation Guard API

## Context

Domain lock mechanics exist, but MVP needs explicit API operations that operators can invoke to unlock, edit, and re-lock transactions safely.

## Scope

- In scope:
  - Add API endpoints for lock/unlock operations by transaction type and ID.
  - Standardize locked-transaction error payloads across intake and outtake mutations.
  - Ensure edit flows call unlock first and lock on save.
  - Add route tests for lock state transitions.
- Out of scope:
  - UI page implementation.
  - Role-based authorization (single-operator MVP).

## Files To Touch

- `apps/web/app/api/transactions/*` (or equivalent lock routes)
- `apps/web/src/*` (lock route helpers/types)
- `apps/web/tests/*` (lock route tests)

## Acceptance Criteria

1. API exposes explicit lock and unlock operations for target transactions.
2. Locked transaction mutation attempts return a consistent machine-readable error code.
3. Unlock operation allows subsequent valid mutation.
4. Re-lock operation restores mutation blocking.
5. Tests verify lock -> blocked mutation -> unlock -> mutate -> re-lock sequence.

## Test Plan

- Unit:
  - Add tests for lock API request validation.
- Integration:
  - Add route tests covering lock state transitions and mutation guard behavior.
- E2E:
  - N/A (covered in smoke suite task).

## Risk Assessment

- Functional risk: High.
- Data risk: Medium.
- Compliance risk: High (immutability control is a merge blocker).

## Rollback Plan

Revert lock/unlock API files and restore previous mutation path behavior.
