# Copilot Instructions

## Project Focus

This repository builds a compliance-sensitive cannabis inventory system. Prioritize correctness for inventory math, lot-level traceability, and transaction locking semantics.

## Coding Priorities

1. Keep business rules in `packages/domain`.
2. Keep persistence concerns in `packages/db`.
3. Keep UI logic in `apps/web` and `packages/ui`.
4. Add tests for all domain behavior changes.

## Critical Invariants

- Outtake cannot exceed available units.
- Locked transactions are read-only until explicit unlock.
- Product identity is unique by `name + category + lot`.
- Units are always positive.

## PR Readiness

Before proposing changes, ensure:

- `pnpm lint` passes
- `pnpm typecheck` passes
- `pnpm test` passes
- Any touched behavior includes or updates tests
