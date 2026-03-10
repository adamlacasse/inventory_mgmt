# Product Backlog

## MVP Must Have

- [x] Intake transaction creation with line items (TASK-002, TASK-011, TASK-018)
- [x] Outtake transaction creation with inventory guardrails (TASK-003, TASK-012, TASK-019)
- [x] Transaction lock/unlock flow (TASK-004, TASK-013)
- [x] Current inventory table with filters (TASK-005, TASK-014, TASK-021)
- [x] Product master list: add/edit/view (TASK-007, TASK-010, TASK-017)
- [x] Transaction history view (TASK-015, TASK-020)
- [x] Basic CSV export of current inventory (TASK-016)
- [x] Seeded local demo flow and runnable setup commands (TASK-022)
- [x] E2E smoke coverage for core workflow (TASK-024)

## Current Ship Condition

MVP is shippable when all of the following remain true on the current branch:

- Authenticated users can complete the end-to-end operator workflow: product -> intake -> outtake -> inventory -> history -> CSV.
- Quality gates are green: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm db:migrate:status`.
- Compliance-critical invariants hold:
  - no over-outtake
  - locked transactions stay immutable until explicit unlock
  - product uniqueness (`productName + productCategory + lotNumber`) is preserved

## Delivered Post-MVP

- [x] Authentication and session access control (TASK-028)
- [x] Role-based authorization and audit attribution (TASK-029)
- [x] Admin user management: admin-only UI + API for create/list/update/deactivate (TASK-031)
- [x] Branding and navigation updates (TASK-027, TASK-030)
- [x] Low stock alerts on inventory view (TASK-033)

## Delivered Near-Term

- [x] Primer design system migration and Tailwind/shadcn cleanup (TASK-036)
- [x] Release automation hardening: CI + deploy migration health (TASK-001, TASK-025, TASK-026)

## Deferred / Later

- [ ] POS integration
- [ ] Cost/value reporting
- [ ] Automated compliance reporting exports
