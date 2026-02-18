# TASK-008: Prisma Repository Adapters for Domain Services

## Context

Domain services are implemented but rely on abstract repositories. MVP requires concrete DB adapters to persist intake/outtake transactions, lock state, product identities, and inventory snapshots using Prisma.

## Scope

- In scope:
  - Implement Prisma-backed adapters for:
    - products repository
    - intake repository
    - outtake repository
    - inventory repository
    - audit repository
  - Map domain payloads to Prisma models and relations.
  - Add repository-level tests validating persistence and guardrail-critical read paths.
- Out of scope:
  - Web route handlers.
  - UI rendering.
  - Non-Prisma database providers.

## Files To Touch

- `packages/db/src/*` (new repository adapter files)
- `packages/db/package.json` (test script deps only if required)
- `packages/db/prisma/schema.prisma` (only if adapter implementation requires missing lock storage)
- `packages/db/tests/*` (new adapter tests)

## Acceptance Criteria

1. Intake repository persists transactions and line items linked to existing products.
2. Outtake repository persists transactions and line items linked to products.
3. Inventory repository returns accurate units on hand by product from persisted intake/outtake items.
4. Product repository supports identity lookup and creation by `name + category + lot`.
5. Audit repository can persist and read lock state for a transaction ID.
6. Integration-style DB tests validate adapter behavior against local SQLite.

## Test Plan

- Unit:
  - Add adapter unit tests for mapping and error translation boundaries.
- Integration:
  - Add Prisma-backed tests covering transaction writes and inventory reads.
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: High.
- Data risk: High (incorrect mapping can corrupt inventory state).
- Compliance risk: High (traceability and lock state depend on persistence correctness).

## Rollback Plan

Revert adapter implementation and tests; rerun existing domain tests to confirm non-persistence logic remains stable.
