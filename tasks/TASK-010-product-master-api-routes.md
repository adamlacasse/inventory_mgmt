# TASK-010: Product Master API Routes

## Context

The MVP requires a usable product master list so operators can add and maintain products before creating intake/outtake entries.

## Scope

- In scope:
  - Add product API routes for list, create, and update.
  - Enforce product identity uniqueness semantics via domain service.
  - Return user-friendly error payloads for validation and identity conflicts.
  - Add route tests for core success and failure cases.
- Out of scope:
  - Product UI pages.
  - Bulk import tooling.

## Files To Touch

- `apps/web/app/api/products/*`
- `apps/web/src/*` (API helpers/types for product endpoints)
- `apps/web/tests/*` (route tests)

## Acceptance Criteria

1. `GET /api/products` returns products with `id`, `productName`, `productCategory`, and `lotNumber`.
2. `POST /api/products` creates a new product when identity does not already exist.
3. Duplicate identity create attempts are rejected with deterministic error responses.
4. `PATCH /api/products/:id` supports editing fields with uniqueness validation preserved.
5. Route tests cover success, invalid payload, and conflict scenarios.

## Test Plan

- Unit:
  - Add tests for request parsing and error mapping helpers.
- Integration:
  - Add route handler tests against wired services.
- E2E:
  - N/A (covered by smoke suite later).

## Risk Assessment

- Functional risk: Medium.
- Data risk: High (bad identity handling breaks product uniqueness).
- Compliance risk: High (lot/category identity is traceability-critical).

## Rollback Plan

Revert product route files and related tests; preserve domain-layer product logic.
