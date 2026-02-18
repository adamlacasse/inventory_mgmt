# TASK-020: Transaction History UI

## Context

Operators need a single place to review intake/outtake records and lock status for auditability. No history page currently exists.

## Scope

- In scope:
  - Add transaction history page with intake/outtake tabs or filters.
  - Show date, type, notes/customer, line-item summary, and lock status.
  - Add date range filters tied to history API.
  - Add unlock/edit entry action that hands off to relevant flow.
  - Add rendering and filter behavior tests.
- Out of scope:
  - Rich analytics charts.
  - Multi-user attribution displays.

## Files To Touch

- `apps/web/app/history/*`
- `apps/web/src/modules/history/*`
- `apps/web/tests/*` (history UI tests)

## Acceptance Criteria

1. History page displays persisted intake and outtake transactions.
2. Lock status is visibly shown for each record.
3. Date range and type filters update visible results deterministically.
4. Empty-state messaging exists for no transactions and no filter matches.
5. UI tests cover baseline render, filter updates, and empty states.

## Test Plan

- Unit:
  - Add tests for history filter/date query utilities.
- Integration:
  - Add page/component tests for history rendering and filtering.
- E2E:
  - Include history verification in smoke suite.

## Risk Assessment

- Functional risk: Medium.
- Data risk: Low.
- Compliance risk: High (history visibility supports regulatory audit readiness).

## Rollback Plan

Revert history UI files and route links while preserving history API endpoints.
