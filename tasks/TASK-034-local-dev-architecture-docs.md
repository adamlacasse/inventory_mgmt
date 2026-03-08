# TASK-034: Document Local Development Architecture

## Context

Developers familiar with a Vite frontend plus separate Node proxy need a clear explanation of how local development works in this monorepo.

## Scope

- In scope:
  - Document how local development maps to a Vite plus proxy workflow.
  - Document the high-level request flow from browser to database in repo-specific terms.
- Out of scope:
  - Runtime behavior changes.
  - Build or deployment workflow changes.

## Files To Touch

- docs/runbooks/local-dev.md

## Acceptance Criteria

1. Local development docs explain that `pnpm dev` runs a single Next.js process for both UI and API routes.
2. Local development docs explain the production-style local flow using build plus start commands.
3. Local development docs include a concise browser-to-database request flow using current repo paths.

## Test Plan

- Unit:
  - Not applicable; documentation-only change.
- Integration:
  - Not applicable; documentation-only change.
- E2E:
  - Not applicable; documentation-only change.

## Risk Assessment

- Functional risk: None; documentation-only change.
- Data risk: None; no persistence changes.
- Compliance risk: None; no inventory or locking behavior changes.

## Rollback Plan

Revert the documentation updates in `docs/runbooks/local-dev.md`.
