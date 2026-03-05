# TASK-030: Organizize Branding Update

## Context

The product now has an official name: `Organizize`. User-facing UI branding and core documentation should reflect the new name consistently.

## Scope

- In scope:
  - Update top-level app brand text in `apps/web` shell and home page.
  - Update root README title and short product description with the new name.
  - Preserve existing inventory, locking, and validation behaviors.
- Out of scope:
  - Domain/package identifiers and internal npm package names.
  - Any schema, migration, API, or transaction behavior changes.

## Files To Touch

- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `README.md`
- `docs/product/README.md`
- `docs/runbooks/local-dev.md`
- `organizize_spec.md`

## Acceptance Criteria

1. App header brand and browser metadata title use `Organizize`.
2. Home page primary title reflects `Organizize` branding.
3. Root README title/intro references `Organizize` consistently.
4. No functional inventory, transaction locking, or validation behavior is changed.

## Test Plan

- Unit:
  - N/A (copy-only UI/documentation updates)
- Integration:
  - Run web app tests to confirm no regressions from updated UI copy.
- E2E:
  - Optional smoke run if needed by release process.

## Risk Assessment

- Functional risk: Low (string copy updates only).
- Data risk: None.
- Compliance risk: None (no behavior changes to lock/guardrail flows).

## Rollback Plan

Revert branding copy changes in the touched files and rename `organizize_spec.md` back if rollback is needed.
