# TASK-012: Outtake API with Customer Field and Guardrails

## Context

Outtake domain rules exist, but API-level behavior is missing and current outtake schema does not carry optional customer metadata from the product specification.

## Scope

- In scope:
  - Extend outtake schema/service to include optional `customer`.
  - Add outtake API routes for create and update.
  - Enforce inventory guardrails and save-lock behavior in API flow.
  - Return deterministic error payloads for insufficient inventory and validation failures.
- Out of scope:
  - Outtake UI implementation.
  - Multi-user attribution fields.

## Files To Touch

- `packages/domain/src/modules/outtake/*`
- `packages/domain/tests/*` (outtake-focused tests only)
- `apps/web/app/api/outtake/*`
- `apps/web/src/*` (outtake API helpers/types)
- `apps/web/tests/*` (outtake route tests)

## Acceptance Criteria

1. Outtake payload supports `date`, optional `customer`, optional `notes`, and one or more line items.
2. Outtake requests exceeding units on hand are rejected with explicit `insufficient inventory` errors.
3. Save operation locks outtake transactions after finalize.
4. Updates to locked outtake transactions are blocked until explicit unlock.
5. Tests cover customer persistence, happy path, non-positive units, and insufficient inventory scenarios.

## Test Plan

- Unit:
  - Update outtake domain tests for customer field support and validation.
- Integration:
  - Add API route tests for guardrail and lock behaviors.
- E2E:
  - N/A (covered in smoke suite task).

## Risk Assessment

- Functional risk: High.
- Data risk: High (outtake errors can overdraw inventory).
- Compliance risk: High (outbound tracking and immutability are regulatory-sensitive).

## Rollback Plan

Revert outtake domain and API changes; rerun outtake/inventory domain tests.
