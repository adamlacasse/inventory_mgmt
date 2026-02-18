# TASK-014: Current Inventory Snapshot API with Filters

## Context

The inventory page currently renders sample static rows. MVP requires a real inventory snapshot endpoint that computes units on hand from persisted intake/outtake records and supports filter controls.

## Scope

- In scope:
  - Add inventory snapshot API endpoint.
  - Compute units on hand from transaction data by product/lot.
  - Support filter query params for product name, category, and lot.
  - Return only rows with `unitsOnHand > 0` by default.
  - Add route tests for filter correctness and empty states.
- Out of scope:
  - Inventory UI styling overhauls.
  - Low stock thresholds.

## Files To Touch

- `apps/web/app/api/inventory/*`
- `apps/web/src/*` (inventory API query/types)
- `apps/web/tests/*` (inventory route tests)
- `packages/db/src/*` (if additional snapshot query adapters are required)

## Acceptance Criteria

1. `GET /api/inventory` returns current units on hand per product + lot with required table fields.
2. Filters for `productName`, `category`, and `lot` are combinable and deterministic.
3. Rows with zero or negative units are excluded by default.
4. Empty result responses are explicit and deterministic for UI rendering.
5. Tests verify unfiltered response, combined filters, and empty-result behavior.

## Test Plan

- Unit:
  - Add tests for filter parsing and query normalization helpers.
- Integration:
  - Add inventory route tests against seeded data.
- E2E:
  - N/A (smoke suite task validates UI integration).

## Risk Assessment

- Functional risk: Medium.
- Data risk: High (snapshot correctness drives operator decisions).
- Compliance risk: High (lot-level on-hand accuracy is compliance-sensitive).

## Rollback Plan

Revert inventory API implementation and restore current sample-data behavior until corrected endpoint is ready.
