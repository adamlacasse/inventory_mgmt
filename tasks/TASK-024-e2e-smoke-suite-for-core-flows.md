# TASK-024: E2E Smoke Suite for Core Flows

## Context

`test:e2e` is currently a placeholder command. A shippable MVP requires one reliable end-to-end smoke suite that verifies critical operator workflows across UI, API, and DB boundaries.

## Scope

- In scope:
  - Replace placeholder e2e command with a real test runner and smoke tests.
  - Cover product creation, intake save, outtake save, inventory verification, lock/unlock/edit flow, and CSV export download.
  - Ensure tests run against seeded local dataset and/or isolated test DB.
- Out of scope:
  - Exhaustive cross-browser matrix.
  - Visual regression testing.

## Files To Touch

- `apps/web/package.json` (replace placeholder `test:e2e`)
- `apps/web/tests/e2e/*`
- `docs/runbooks/local-dev.md` (e2e execution steps)

## Acceptance Criteria

1. `pnpm test:e2e` runs a real test suite and exits non-zero on failures.
2. Smoke suite validates full workflow:
   - product create/edit
   - intake create/save
   - outtake create/save with guardrail behavior
   - inventory reflects net units
   - lock/unlock controls editability
   - CSV export returns expected file shape
3. Tests are deterministic in local and CI environments.
4. Failure output is actionable (clear step/assertion context).

## Test Plan

- Unit:
  - N/A (e2e task).
- Integration:
  - Validate environment bootstrapping used by e2e.
- E2E:
  - Implement and run smoke suite for critical flows.

## Risk Assessment

- Functional risk: Medium.
- Data risk: Medium.
- Compliance risk: High (lack of e2e coverage leaves compliance-critical paths unverified).

## Rollback Plan

Revert e2e framework and restore previous command temporarily only if replacement is blocking unrelated delivery.
