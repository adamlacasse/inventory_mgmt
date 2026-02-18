# TASK-021: Inventory Page Real Data Integration

## Context

The current inventory UI is wired to static sample rows. MVP requires the inventory page to consume live inventory API data so operators see real on-hand values.

## Scope

- In scope:
  - Replace static `sampleInventoryRows` runtime usage with API-backed fetch.
  - Preserve existing filter UX while sourcing data dynamically.
  - Handle loading, error, and empty states.
  - Add tests for real-data rendering states.
- Out of scope:
  - New inventory filtering features beyond existing fields.
  - UI redesign outside this page.

## Files To Touch

- `apps/web/app/inventory/page.tsx`
- `apps/web/src/modules/inventory/*`
- `apps/web/tests/*` (inventory integration tests)

## Acceptance Criteria

1. Inventory page fetches rows from inventory API at runtime/server render.
2. Static sample data file is not used by production page path.
3. Existing product/category/lot filters continue to work deterministically.
4. Page renders explicit states for loading, API failure, and no data.
5. Tests cover successful load, no-data, and error paths.

## Test Plan

- Unit:
  - Add tests for inventory API client and response normalization.
- Integration:
  - Add page tests for API-backed render with mocked responses.
- E2E:
  - Validate inventory page reflects prior intake/outtake actions in smoke suite.

## Risk Assessment

- Functional risk: Medium.
- Data risk: High (static data in production would invalidate operator decisions).
- Compliance risk: High (displayed inventory must match transaction reality).

## Rollback Plan

Revert inventory integration changes and temporarily restore static render while API issues are resolved.
