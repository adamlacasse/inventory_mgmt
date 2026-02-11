# TASK-004: Transaction Lock/Unlock Flow

## Context

Implement domain lock/unlock behavior so finalized transactions cannot be mutated without an explicit unlock operation.

## Scope

- In scope:
  - Domain-level lock and unlock operations
  - Mutation guard that blocks updates while a transaction is locked
  - Unit tests for lock/unlock transitions and blocked mutation attempts
- Out of scope:
  - UI lock/unlock controls
  - Reporting and export features
  - Changes to unrelated domain modules

## Files To Touch

- `packages/domain/src/modules/audit/*`
- `packages/domain/src/modules/intake/*` (only if required for lock-state enforcement)
- `packages/domain/src/modules/outtake/*` (only if required for lock-state enforcement)
- `packages/domain/tests/*` (locking-focused tests only)
- `packages/domain/src/index.ts` (exports only, if needed)

## Acceptance Criteria

1. Domain exposes explicit lock and unlock operations for transactions.
2. Locked transactions reject mutation attempts until explicitly unlocked.
3. Unlock operation re-enables allowed mutation behavior for the target transaction.
4. Unit tests verify lock transition, blocked mutation while locked, and successful mutation after unlock.

## Test Plan

- Unit:
  - Add/update lock/unlock domain tests covering both lock and unlock flows.
- Integration:
  - N/A (domain-only task).
- E2E:
  - N/A.

## Risk Assessment

- Functional risk: High (transaction mutability controls)
- Data risk: Medium (incorrect lock state can cause accidental edits)
- Compliance risk: High (locked transactions must remain immutable)

## Rollback Plan

Revert the task commit and rerun domain tests to confirm lock behavior returns to baseline.
