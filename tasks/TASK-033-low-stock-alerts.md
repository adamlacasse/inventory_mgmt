# TASK-033: Low Stock Alerts

## Context

Operators need a clear warning when inventory lots are getting close to depletion so they can take action before customer-facing shortages occur.

## Scope

- In scope:
  - Add low-stock alert presentation to the inventory page.
  - Add a low-stock-only filter in the inventory UI.
  - Highlight low-stock rows with a deterministic threshold.
  - Add tests for low-stock filtering and rendering.
- Out of scope:
  - Schema changes or per-product reorder thresholds.
  - Email, SMS, or background notification delivery.
  - Changes to intake, outtake, locking, or persistence behavior.

## Files To Touch

- `apps/web/src/modules/inventory/*`
- `apps/web/app/globals.css`

## Acceptance Criteria

1. Inventory page shows a low-stock alert summary when one or more rows are at or below the configured threshold.
2. Inventory page includes a filter that limits the table to low-stock rows only.
3. Low-stock rows are visually distinguishable from healthy rows.
4. Existing inventory filtering by product, category, and lot continues to work.
5. Tests cover low-stock filtering logic and rendered alert output.

## Test Plan

- Unit:
  - Update inventory filter tests to cover low-stock-only behavior.
  - Update inventory view tests to cover alert summary and low-stock rendering.
- Integration:
  - Run `pnpm --filter @inventory/web test`.
- E2E:
  - N/A for this task.

## Risk Assessment

- Functional risk: Low.
- Data risk: Low.
- Compliance risk: Low.

## Rollback Plan

Revert the inventory UI changes and remove the low-stock-only filter and styling.
