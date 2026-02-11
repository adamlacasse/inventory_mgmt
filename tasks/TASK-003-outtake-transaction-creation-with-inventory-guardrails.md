# TASK-003: Outtake Transaction Creation with Inventory Guardrails

## Context

Implement domain behavior for outtake transactions with strict inventory checks so outbound units cannot exceed available inventory.

## Scope

- In scope:
  - Outtake transaction input schema and validation rules
  - Guardrail logic that blocks outtake units greater than units on hand
  - Unit tests for outtake validation and inventory guardrails
- Out of scope:
  - Intake creation behavior
  - UI workflows and route handlers
  - Lock/unlock transaction behavior

## Files To Touch

- `packages/domain/src/modules/outtake/*`
- `packages/domain/src/modules/inventory/*` (guardrail helpers only)
- `packages/domain/tests/*` (outtake-focused tests only)
- `packages/domain/src/index.ts` (exports only, if needed)

## Acceptance Criteria

1. Outtake domain service supports creating a draft transaction with one or more line items.
2. Outtake line items with non-positive `units` are rejected.
3. Outtake requests are rejected when requested units exceed current units on hand for any product.
4. A request equal to units on hand is accepted.
5. Unit tests cover successful outtake, exceeded inventory rejection, and non-positive unit rejection.

## Test Plan

- Unit:
  - Add/update outtake and inventory domain tests for guardrail behavior.
- Integration:
  - N/A (domain-only task).
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: High (core inventory control path)
- Data risk: High (overdrawn inventory corrupts records)
- Compliance risk: High (outtake beyond inventory is a merge blocker)

## Rollback Plan

Revert the task commit and rerun domain tests to verify baseline guardrail behavior.
