# TASK-015: Transaction History API

## Context

MVP requires a basic audit trail view for intake and outtake transactions. There is currently no route-level history endpoint exposing persisted transaction records.

## Scope

- In scope:
  - Add history endpoints for intake and outtake transaction listing.
  - Include lock state, date, notes, and outtake customer where applicable.
  - Support basic date range filtering and type filtering.
  - Add tests for ordering and filter behavior.
- Out of scope:
  - History UI page.
  - Advanced analytics or financial reporting.

## Files To Touch

- `apps/web/app/api/history/*`
- `apps/web/src/*` (history API types/query parsing)
- `apps/web/tests/*` (history route tests)

## Acceptance Criteria

1. History API returns intake and outtake records with transaction metadata and line items.
2. Response includes lock status so UI can signal immutable vs editable records.
3. Date range filters produce deterministic record subsets.
4. Results are ordered consistently (newest first unless explicitly configured otherwise).
5. Route tests cover both transaction types, filter combinations, and empty date ranges.

## Test Plan

- Unit:
  - Add tests for date-range parser and response serializer.
- Integration:
  - Add route tests for mixed intake/outtake datasets.
- E2E:
  - N/A (history UI flow validated in later e2e task).

## Risk Assessment

- Functional risk: Medium.
- Data risk: Medium.
- Compliance risk: High (history visibility supports audit traceability).

## Rollback Plan

Revert history API routes and helpers; preserve persistence-layer behavior.
