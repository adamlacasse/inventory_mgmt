# TASK-027: Global Navigation Links

## Context

Stakeholders need to jump between any page during demos without relying on the home screen.

## Scope

- In scope:
  - Add a global navigation bar that links to all primary pages.
  - Ensure navigation is visible on every page.
- Out of scope:
  - Authentication or role-based menus.
  - Active-route highlighting.

## Files To Touch

- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`

## Acceptance Criteria

1. Navigation links to Home, Products, Intake, Outtake, Inventory, History, and CSV Export.
2. Navigation is visible on every page.
3. No behavior changes to existing forms or data flows.

## Test Plan

- Unit:
  - N/A (UI-only change).
- Integration:
  - Navigate between pages using the header links.
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: Low.
- Data risk: None.
- Compliance risk: Low.

## Rollback Plan

Revert header and CSS changes to restore prior layout.
