# TASK-036: Primer Design System Migration

## Context

The current UI looks better than the original BEM styling, but it still does not operate from a coherent design system. The app is currently a mix of repeated utility-class styling and a partial Tailwind/shadcn direction that should not become the long-term foundation.

This task replaces that direction with a Primer-based design system and explicitly plans the cleanup required to remove Tailwind and shadcn once the migration is complete.

## Scope

- In scope:
  - Adopt Primer as the primary public design system reference and component foundation for the web app.
  - Build reusable, presentation-only UI wrappers in `packages/ui`.
  - Migrate the app shell and the main operator/admin workflows onto consistent Primer-based patterns.
  - Remove Tailwind and shadcn artifacts after screen migration is complete.
  - Preserve brand identity while improving typography, spacing, hierarchy, and data-display consistency.
- Out of scope:
  - Any changes to domain logic, API behavior, Prisma schema, locking rules, or inventory validation.
  - New product features beyond design-system parity and cleanup.
  - Reworking navigation structure or workflow order beyond what is needed for visual consistency.

## Files To Touch

- `tasks/TASK-036-primer-design-system-migration.md`
- `docs/product/primer-design-system-migration.md`
- `apps/web/app/layout.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/login/page.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/admin/users/AdminUsersClient.tsx`
- `apps/web/src/modules/auth/LogoutButton.tsx`
- `apps/web/src/modules/inventory/InventoryPageView.tsx`
- `apps/web/src/modules/intake/IntakePageView.tsx`
- `apps/web/src/modules/outtake/OuttakePageView.tsx`
- `apps/web/src/modules/history/HistoryPageView.tsx`
- `apps/web/src/modules/products/ProductPageView.tsx`
- `apps/web/package.json`
- `packages/ui/src/*`
- `packages/ui/package.json`

## Migration Order

1. Add Primer foundation and theme wiring without changing server or domain behavior.
2. Create shared presentational wrappers in `packages/ui`.
3. Migrate low-risk screens first: shell, login, home, inventory, products, history.
4. Migrate compliance-sensitive transaction flows second: intake, outtake, admin users.
5. Remove all Tailwind and shadcn artifacts after every migrated screen is off the temporary styling path.
6. Re-run quality gates and capture final UI evidence.

The detailed execution plan lives in `docs/product/primer-design-system-migration.md`.

## Acceptance Criteria

1. `apps/web` uses Primer-based theme and component primitives as the primary design system.
2. Shared, presentation-only design-system wrappers live in `packages/ui`, with no business logic added there.
3. The app shell and all key workflows use consistent page headers, forms, tables, alerts, badges, and action layouts.
4. Tailwind CDN usage is removed from the app shell, and no shadcn-generated components or config remain.
5. Tailwind dependencies and config are removed once the migration is complete and no longer needed.
6. Inventory guardrails, locked transaction behavior, and product uniqueness behavior remain unchanged.
7. Required quality gates pass after the implementation is complete.

## Test Plan

- Unit:
  - Update existing UI tests to reflect the new component structure without changing behavioral assertions.
  - Add or update tests for any new shared UI wrappers that contain non-trivial rendering logic.
- Integration:
  - Run `pnpm lint`.
  - Run `pnpm typecheck`.
  - Run `pnpm test`.
- E2E:
  - Run `pnpm test:e2e`.
  - Capture screenshots for the migrated screens as PR evidence.

## Risk Assessment

- Functional risk: Moderate, because multiple operator screens will be re-wired at the presentation layer.
- Data risk: None, assuming no server, schema, or domain logic changes are introduced.
- Compliance risk: Moderate, because intake/outtake/history screens are operator-critical and must preserve lock and inventory guardrails.

## Rollback Plan

Implement the migration in small commits by phase. If a phase causes regressions, revert the affected UI-layer commits only and restore the prior presentation until the issue is isolated. Do not roll back or alter any server, domain, or database code as part of this task.
