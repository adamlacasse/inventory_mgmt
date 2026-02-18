# TASK-017: Product Master UI

## Context

Operators need a simple product management interface to add and edit products before intake and outtake entries. The web app currently lacks product master pages.

## Scope

- In scope:
  - Add product list page with table columns: name, category, lot.
  - Add create product form.
  - Add inline or modal edit flow for existing products.
  - Show clear validation and duplicate-identity errors.
  - Add UI tests for core rendering and form behavior.
- Out of scope:
  - Bulk import UX.
  - Advanced sort/pagination.

## Files To Touch

- `apps/web/app/products/*`
- `apps/web/src/modules/products/*`
- `apps/web/tests/*` (products UI tests)

## Acceptance Criteria

1. Product page displays persisted product records from API.
2. Operator can create a product using name/category/lot inputs.
3. Duplicate identity attempts render an actionable error message.
4. Operator can edit product values while uniqueness is preserved.
5. UI tests cover initial load, create success, create conflict, and edit success.

## Test Plan

- Unit:
  - Add tests for products module client-side request/validation helpers.
- Integration:
  - Add page/component tests for list/create/edit states.
- E2E:
  - Include create/edit product flow in later smoke suite.

## Risk Assessment

- Functional risk: Medium.
- Data risk: High (bad UX can cause duplicate or malformed master records).
- Compliance risk: High (product identity impacts lot traceability).

## Rollback Plan

Revert products page/module files while preserving API endpoints.
