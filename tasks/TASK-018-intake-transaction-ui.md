# TASK-018: Intake Transaction UI

## Context

MVP needs a usable intake screen for recording received inventory. No intake page exists yet in the web app.

## Scope

- In scope:
  - Add intake page with date, optional notes, and line item editor.
  - Support selecting existing products and creating new identity entries inline.
  - Provide add/remove line item interactions.
  - Add save action that finalizes and locks transaction.
  - Show validation and submission errors clearly.
- Out of scope:
  - Multi-step wizard UX.
  - Bulk CSV intake import.

## Files To Touch

- `apps/web/app/intake/*`
- `apps/web/src/modules/intake/*`
- `apps/web/tests/*` (intake UI tests)

## Acceptance Criteria

1. Intake form submits valid payload to API and shows success confirmation.
2. Form blocks submission for invalid line items (missing product identity fields or non-positive units).
3. Save action results in locked transaction state indicated in UI response.
4. Operator can create multi-line intake transactions in one submission.
5. UI tests cover happy path, client validation errors, and API error rendering.

## Test Plan

- Unit:
  - Add intake form state tests for line-item operations.
- Integration:
  - Add page/component tests for form submission and error states.
- E2E:
  - Include intake create + save in smoke flow.

## Risk Assessment

- Functional risk: High.
- Data risk: High (intake UI directly changes on-hand units).
- Compliance risk: High (saved transaction correctness is audit-sensitive).

## Rollback Plan

Revert intake UI files while preserving API/domain behavior.
