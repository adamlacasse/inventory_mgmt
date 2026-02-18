# TASK-023: Quality Gate Stabilization

## Context

Current `pnpm check` is failing on lint/format issues, and DB status checks are environment-sensitive. MVP release readiness requires all standard quality gates to pass consistently.

## Scope

- In scope:
  - Resolve lint/format/typecheck/test failures across touched packages.
  - Ensure db status command has documented environment prerequisites.
  - Add/adjust CI workflow steps only if required for deterministic outcomes.
- Out of scope:
  - New feature implementation.
  - Large refactors unrelated to quality gate compliance.

## Files To Touch

- `packages/domain/*` (lint and formatting fixes)
- `.github/workflows/*` (only if workflow adjustment is required)
- `docs/runbooks/local-dev.md` (quality gate prerequisites)

## Acceptance Criteria

1. `pnpm lint` passes at repo root.
2. `pnpm typecheck` passes at repo root.
3. `pnpm test` passes at repo root.
4. `pnpm test:e2e` executes expected suite (placeholder removed by TASK-024).
5. `pnpm db:migrate:status` passes with documented local env setup.

## Test Plan

- Unit:
  - N/A (stabilization task).
- Integration:
  - Execute full `pnpm check` and capture command summary in runbook/report.
- E2E:
  - Confirm e2e command integration with updated suite script.

## Risk Assessment

- Functional risk: Low.
- Data risk: Low.
- Compliance risk: High (unverified code in compliance-critical domain is a ship blocker).

## Rollback Plan

Revert stabilization changes that are non-essential and reapply minimal fixes iteratively until gates pass.
