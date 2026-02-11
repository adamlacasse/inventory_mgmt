# TASK-005: Current Inventory Table with Filters

## Context

Implement an inventory view in the web app so operators can quickly inspect units on hand and filter by product attributes.

## Scope

- In scope:
  - Inventory page route in `apps/web`
  - Inventory table presentation for current units on hand
  - Client-side filter controls for common operator queries
  - Tests for filter behavior and rendering states
- Out of scope:
  - New domain business rules
  - CSV export
  - Lock/unlock behavior changes

## Files To Touch

- `apps/web/app/*` (inventory route only)
- `apps/web/src/modules/inventory/*`
- `apps/web/package.json` (test tooling scripts only, if required)

## Acceptance Criteria

1. Web app provides an inventory page displaying a table with product name, category, lot, and units on hand.
2. Page includes filters for product name, category, and lot number.
3. Filter controls can be combined and update visible rows deterministically.
4. Empty-state rendering is present for both no inventory data and no filter matches.
5. Tests cover filtering logic and core rendering states.

## Test Plan

- Unit:
  - Add/update tests for filter logic in the inventory module.
- Integration:
  - Add/update page rendering tests for populated and empty states.
- E2E:
  - Execute `pnpm test:e2e` (expected placeholder output is acceptable until suite exists).

## Risk Assessment

- Functional risk: Medium (operator workflow visibility)
- Data risk: Low (read-only presentation)
- Compliance risk: Medium (incorrect display can cause operational errors)

## Rollback Plan

Revert the task commit and remove the new inventory route/module files.
