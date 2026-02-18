# TASK-019: Outtake Transaction UI

## Context

MVP needs a usable outtake screen for sales/depletion logging with inventory guardrails surfaced to users.

## Scope

- In scope:
  - Add outtake page with date, optional customer, optional notes, and line item editor.
  - Restrict product selection to available inventory options.
  - Display insufficient inventory errors from API in user-friendly terms.
  - Save action finalizes and locks transaction.
  - Add UI tests for guardrail behavior.
- Out of scope:
  - POS integration.
  - Advanced customer management.

## Files To Touch

- `apps/web/app/outtake/*`
- `apps/web/src/modules/outtake/*`
- `apps/web/tests/*` (outtake UI tests)

## Acceptance Criteria

1. Outtake form supports optional customer field and persists it.
2. Product selector only presents records with `unitsOnHand > 0`.
3. Overdraw attempts show explicit insufficient inventory feedback.
4. Successful save returns locked transaction state.
5. UI tests cover success, insufficient inventory, and validation failures.

## Test Plan

- Unit:
  - Add outtake form state and request payload tests.
- Integration:
  - Add component/page tests for guardrail error rendering.
- E2E:
  - Include outtake flow in smoke suite with both success and failure branch.

## Risk Assessment

- Functional risk: High.
- Data risk: High (outtake path can overdraw inventory if mishandled).
- Compliance risk: High (sales/depletion trail must be accurate).

## Rollback Plan

Revert outtake UI files while keeping API/domain guardrails intact.
