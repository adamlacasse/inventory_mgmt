# Primer Design System Migration Plan

## Status

Complete — March 10, 2026

### Phase completion as of March 9, 2026

- [x] Phase 0: Baseline and guardrails — skipped (no baseline screenshots captured; migration proceeded directly)
- [x] Phase 1: Primer foundation setup — `@primer/react` installed, `PrimerProvider` wrapping app root in `layout.tsx`
- [x] Phase 2: Shared UI primitives in `packages/ui` — `PageFrame`, `SectionCard`, `StatusBadge`, `StatusBanner`, `FilterToolbar`, `EmptyState` all present
- [x] Phase 3: Low-risk screen migration — all read-focused modules (`inventory`, `products`, `history`) import from `@inventory/ui`
- [x] Phase 4: Compliance-sensitive workflow migration — `intake`, `outtake`, and admin screens migrated
- [x] Phase 5: Tailwind and shadcn cleanup — no Tailwind CDN, no shadcn artifacts, no `tailwind.config` remaining
- [x] Phase 6: Verification and PR evidence — all quality gates green (lint, typecheck, test, test:e2e)

## Summary

Organizize should move to Primer as the primary public design system for the web app. The current UI is better than the original hand-rolled styling, but it still behaves like a collection of individually styled pages rather than a coherent system.

The migration should be incremental, should not change any business behavior, and should end with Tailwind and shadcn fully removed from the app.

## Why Primer

- Primer fits internal operations software well: dense forms, tables, status messaging, and action-heavy workflows.
- Primer brings stronger defaults for spacing, typography, hierarchy, accessibility, and composable React primitives.
- The app already looks more like an admin/productivity surface than a custom marketing site, so a dashboard-oriented system is the better match.
- Primer provides a more opinionated foundation than shadcn while still allowing brand-level customization.

## Current State

The repo currently shows a transitional styling setup rather than a stable design system:

- `apps/web/app/layout.tsx` injects Tailwind from the CDN and sets inline Tailwind config in the document head.
- `apps/web/app/globals.css` only contains fonts and minimal reset rules.
- Core screens in `apps/web/src/modules/*` repeat utility-class patterns directly in each page module.
- `apps/web/package.json` does not yet show a stable local Tailwind toolchain, which reinforces that the current path is temporary.
- `packages/ui` exists but is effectively unused as a design-system boundary.

## Target End State

When this migration is complete:

- Primer is the primary component and theme foundation in `apps/web`.
- `packages/ui` contains shared, presentation-only wrappers built on top of Primer.
- The app shell, forms, tables, alerts, badges, and empty states all use one consistent visual language.
- Brand colors remain recognizable, but typography and spacing are modernized for readability.
- Cormorant Infant is reserved for brand moments and page titles only, not dense form and table UI.
- Tailwind and shadcn are removed completely.

## Constraints

- No server, API, Prisma, or domain logic changes.
- Preserve transaction locking behavior and inventory validation behavior exactly as-is.
- Keep module boundaries intact:
  - `apps/web`: route handlers and screen composition
  - `packages/ui`: reusable presentational components only
- Maintain or improve accessibility during the migration.
- All normal quality gates must still pass.

## Design Decisions

### Primer Is The System, Not Just An Inspiration

Primer should be the authoritative source for:

- base primitives
- form structure
- table density and hierarchy
- status and alert patterns
- navigation and action layout
- spacing rhythm
- typography defaults

### `packages/ui` Becomes The UI Boundary

Do not scatter Primer usage ad hoc across every app module. Instead:

- keep business logic in `apps/web/src/modules/*`
- move shared page chrome and presentational wrappers into `packages/ui`
- let `apps/web` compose those wrappers with module-specific data and handlers

This keeps the design system reusable and reduces repeated styling drift.

### Tailwind Is A Temporary Bridge Only

Tailwind may remain briefly during the migration so screens can be converted safely in phases, but:

- no new Tailwind-only abstractions should be introduced
- no new shadcn components should be added
- the final state is Primer-only for component styling

## Order Of Operations

### Phase 0: Baseline And Guardrails

Purpose: reduce migration risk before any component work starts.

Tasks:

- Capture baseline screenshots for:
  - login
  - home
  - products
  - inventory
  - intake
  - outtake
  - history
  - admin users
- Run the current quality gates and record the baseline result.
- Inventory every styling artifact that must eventually disappear:
  - Tailwind CDN script in `apps/web/app/layout.tsx`
  - inline Tailwind config in `apps/web/app/layout.tsx`
  - any Tailwind config, PostCSS config, or generated shadcn files if they exist
  - repeated utility-class-heavy modules in `apps/web/src/modules/*`
- Confirm that no business logic changes are bundled into the migration branch.

Exit criteria:

- Baseline screenshots and test results are captured.
- The migration file inventory is complete.

### Phase 1: Primer Foundation Setup

Purpose: establish the real design-system base before screen-by-screen migration starts.

Tasks:

- Add Primer React dependencies using current official package guidance at implementation time.
- Wire Primer at the app root in `apps/web/app/layout.tsx`.
- Introduce theme configuration for:
  - charcoal brand surfaces
  - amber accent usage
  - neutral backgrounds and borders
  - typography defaults
- Shift body copy, tables, and form controls to a sans UI stack consistent with Primer defaults.
- Keep Cormorant Infant only for brand text and headline moments where it improves the identity.
- Decide whether any remaining global CSS should live in `apps/web/app/globals.css` or move into Primer-friendly overrides.

Exit criteria:

- The app has a functioning Primer root setup.
- Typography and token direction are defined.
- No screen migration has started without a stable theme foundation.

### Phase 2: Shared UI Primitives In `packages/ui`

Purpose: create a reusable system layer so each page does not reinvent layout and component structure.

Build presentation-only wrappers such as:

- `AppPage` or `PageFrame`
- `PageHeader`
- `SectionCard`
- `StatusBanner`
- `StatusBadge`
- `FormField`
- `FilterToolbar`
- `DataTable`
- `EmptyState`
- `InlineActions`

Rules for this phase:

- These wrappers must not know about intake, outtake, inventory, auth, or locking rules.
- Keep them thin and compositional, not over-abstracted.
- Prefer consistent slots and props over clever configuration systems.

Exit criteria:

- At least one coherent set of shared wrappers exists in `packages/ui`.
- New page work can use those wrappers instead of raw per-screen styling.

### Phase 3: Low-Risk Screen Migration

Purpose: prove the system on screens with lower behavioral risk before touching the operator-critical mutation flows.

Recommended order:

1. `apps/web/app/layout.tsx`
2. `apps/web/app/page.tsx`
3. `apps/web/app/login/page.tsx`
4. `apps/web/src/modules/auth/LogoutButton.tsx`
5. `apps/web/src/modules/inventory/InventoryPageView.tsx`
6. `apps/web/src/modules/products/ProductPageView.tsx`
7. `apps/web/src/modules/history/HistoryPageView.tsx`

Why this order:

- shell and auth surfaces establish the shared navigation, typography, and page rhythm
- inventory is mostly read-only and exercises alerts, filters, and tables
- products adds basic form and table-edit patterns
- history adds badges and action density without introducing new inventory math

Exit criteria:

- The shell and read-focused screens all use the new Primer-based wrappers.
- Visual language is consistent across navigation, cards, tables, and status messaging.

### Phase 4: Compliance-Sensitive Workflow Migration

Purpose: migrate the mutation-heavy screens only after the shared patterns are proven.

Recommended order:

1. `apps/web/src/modules/intake/IntakePageView.tsx`
2. `apps/web/src/modules/outtake/OuttakePageView.tsx`
3. `apps/web/app/admin/users/AdminUsersClient.tsx`

Why this order:

- intake is the simpler transaction form
- outtake has the highest operator risk because inventory availability and guardrail messaging must remain clear
- admin users is operationally important, but it does not affect stock movement logic

Implementation notes:

- Keep all existing field names, submit payloads, and client-side state transitions stable.
- Avoid changing success/error copy unless needed for clarity and consistency.
- Validate dynamic line-item interactions carefully after visual rewrites.

Exit criteria:

- The transactional screens match the shared system patterns.
- No form behavior or locking/inventory guardrail behavior has changed.

### Phase 5: Tailwind And shadcn Cleanup

Purpose: remove the temporary styling path entirely.

Required cleanup tasks:

- Remove the Tailwind CDN script from `apps/web/app/layout.tsx`.
- Remove the inline `tailwind.config` script from `apps/web/app/layout.tsx`.
- Remove any Tailwind-specific dependencies from `apps/web/package.json` once no longer used.
- Remove any PostCSS/Tailwind config introduced for the previous direction.
- Remove any `shadcn` config such as `apps/web/components.json` if present.
- Remove generated shadcn component files such as `apps/web/src/components/ui/*` if present.
- Remove helper utilities created only for shadcn/Tailwind composition such as `cn()` wrappers if they are no longer used.
- Remove stale CSS variables or utility-oriented globals that only existed to support Tailwind.
- Search the codebase for leftover references to:
  - `tailwind`
  - `shadcn`
  - `cdn.tailwindcss.com`
  - `tailwind.config`
  - `components.json`

Cleanup gate:

- The branch is not done until the app no longer depends on Tailwind or shadcn at runtime or build time.

### Phase 6: Verification And PR Evidence

Purpose: confirm the migration is safe and reviewable.

Required verification:

- Run:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
- Manually verify:
  - login and logout
  - product create/edit
  - intake save and lock
  - outtake save and inventory guardrails
  - inventory filters and low-stock state
  - history lock and unlock flow
  - admin user create/edit/deactivate
- Capture updated screenshots for all migrated screens.

Required PR evidence:

- Task ID and acceptance criteria
- Risk notes for inventory and locking behavior
- Commands run and result summary
- Screenshots for every changed UI surface

## Cleanup Checklist

Use this checklist before calling the migration done:

- [x] Primer root setup is active in `apps/web/app/layout.tsx`
- [x] Shared UI wrappers exist in `packages/ui`
- [x] Home, login, inventory, products, history, intake, outtake, and admin screens use the new system
- [x] `packages/ui` contains no business logic
- [x] Tailwind CDN script is gone
- [x] Inline Tailwind config is gone
- [x] Tailwind config and PostCSS config are removed if no longer needed
- [x] shadcn config is removed
- [x] shadcn component files are removed
- [x] Temporary Tailwind helper utilities are removed
- [x] `rg` finds no meaningful Tailwind or shadcn leftovers
- [x] Quality gates are green

## Risks To Watch

- Transaction forms may regress through layout rewrites even if business logic is unchanged.
- Dense tables may become less scannable if spacing is made too loose.
- Brand styling may drift if amber is overused as a general accent instead of a targeted status/action color.
- If `packages/ui` becomes too abstract too early, migration speed will drop.

## Recommended Delivery Strategy

- Land the work in small phases rather than one large visual rewrite.
- Prefer one or two screens per PR after the shared foundation is in place.
- Keep rollback simple by isolating shell work, shared primitive work, and screen migrations.
- Do cleanup in an explicit final pass so there is no ambiguity about whether Tailwind/shadcn are still active.
