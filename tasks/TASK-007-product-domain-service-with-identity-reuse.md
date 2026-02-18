# TASK-007: Product Domain Service with Identity Reuse

## Context

The products module is currently a stub. The MVP needs reliable product identity handling to enforce uniqueness by `productName + productCategory + lotNumber` and support product creation during intake workflows.

## Scope

- In scope:
  - Implement product domain input schema for product identity payloads.
  - Implement product service behavior to find existing products or create a new one.
  - Add explicit domain errors for invalid payload and identity conflicts.
  - Add unit tests for create-vs-reuse logic.
- Out of scope:
  - Web route handlers and UI.
  - Prisma schema migration changes.

## Files To Touch

- `packages/domain/src/modules/products/*`
- `packages/domain/tests/*` (products-focused tests only)
- `packages/domain/src/index.ts` (exports only, if needed)

## Acceptance Criteria

1. Product service accepts `productName`, `productCategory`, and `lotNumber` and validates each as non-empty trimmed strings.
2. Service returns existing `productId` when identity already exists.
3. Service creates and returns a new `productId` when identity does not exist.
4. Domain errors are explicit and distinguish invalid payload from repository failure conditions.
5. Unit tests cover successful reuse, successful create, and validation failures.

## Test Plan

- Unit:
  - Add products service tests for identity reuse and new record creation paths.
  - Add tests for empty/invalid name, category, and lot payloads.
- Integration:
  - N/A (domain-only task).
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: Medium.
- Data risk: High (identity logic affects product uniqueness integrity).
- Compliance risk: High (lot-level traceability depends on product identity correctness).

## Rollback Plan

Revert product module and tests, then rerun domain tests to confirm baseline behavior.
