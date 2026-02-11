# TASK-002: Intake Transaction Creation with Line Items

## Context

Implement domain behavior for creating intake transactions with validated line items so inbound inventory can be captured consistently.

## Scope

- In scope:
  - Intake transaction input schema and validation rules
  - Domain service behavior for draft intake transaction creation
  - Unit tests for intake creation success and failure cases
- Out of scope:
  - Outtake behavior
  - Transaction lock/unlock behavior
  - UI workflows and route handlers

## Files To Touch

- `packages/domain/src/modules/intake/*`
- `packages/domain/tests/*` (intake-focused tests only)
- `packages/domain/src/index.ts` (exports only, if needed)

## Acceptance Criteria

1. Intake domain service supports creating a draft transaction with `date`, optional `notes`, and one or more line items.
2. Each intake line item requires a valid `productId` and positive `units`; invalid payloads are rejected with explicit domain errors.
3. Empty line-item arrays are rejected.
4. Unit tests cover successful creation plus validation failures for empty items, missing product IDs, and non-positive units.

## Test Plan

- Unit:
  - Add/update intake domain tests for happy-path and validation failures.
- Integration:
  - N/A (domain-only task).
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: Medium (new transaction behavior)
- Data risk: Medium (incorrect intake units can skew inventory)
- Compliance risk: Medium (inventory accuracy is compliance-sensitive)

## Rollback Plan

Revert the task commit and rerun domain tests to confirm baseline behavior.
