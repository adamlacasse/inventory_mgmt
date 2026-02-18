# TASK-009: Web Service Composition Layer

## Context

Web routes need a single composition entrypoint that wires domain services to Prisma adapters. Without this layer, route handlers risk inconsistent construction and duplicated dependency logic.

## Scope

- In scope:
  - Create a server-side composition module in `apps/web` that instantiates domain services with DB adapters.
  - Provide typed helpers for obtaining services in route handlers.
  - Ensure composition is request-safe for Next.js route execution.
- Out of scope:
  - Route implementation details for specific features.
  - UI components.
  - Domain rule changes.

## Files To Touch

- `apps/web/src/*` (service container/composition files)
- `apps/web/tsconfig.json` (path aliases only if needed)

## Acceptance Criteria

1. A single composition entrypoint exists for products, intake, outtake, inventory, and audit services.
2. Route handlers can import one stable interface for service access.
3. Composition layer avoids duplicated initialization logic across routes.
4. Type-safe interfaces prevent untyped `any` service wiring.
5. Tests validate composition output shape and core wiring sanity.

## Test Plan

- Unit:
  - Add tests for service container construction and exported provider contract.
- Integration:
  - N/A (API route behavior covered in later tasks).
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: Medium.
- Data risk: Low.
- Compliance risk: Medium (incorrect wiring can bypass intended domain controls).

## Rollback Plan

Revert composition files and restore previous route-level wiring approach.
