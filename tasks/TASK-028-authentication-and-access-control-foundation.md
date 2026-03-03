# TASK-028: Authentication and Access Control Foundation

## Context

The MVP intentionally shipped without authentication for speed, but near-term rollout requires access control so inventory and transaction APIs are not publicly mutable.

## Scope

- In scope:
  - Add a baseline authentication flow for named operator login/logout.
  - Protect all non-public UI routes (`/products`, `/intake`, `/outtake`, `/inventory`, `/history`) behind authenticated session checks.
  - Protect mutation-capable API routes with authentication checks and deterministic `401` responses for unauthenticated requests.
  - Add auth configuration and environment guidance for local and hosted deployments.
  - Add tests covering authenticated success and unauthenticated rejection paths.
- Out of scope:
  - Fine-grained RBAC/permissions by role.
  - SSO/OAuth provider integrations.
  - MFA, password reset, invite flows, or user-admin UI.

## Files To Touch

- `apps/web/app/*` (login route + protected route behavior)
- `apps/web/app/api/*` (auth guard integration for protected endpoints)
- `apps/web/src/server/*` (auth/session helpers and middleware integration)
- `apps/web/.env.example`
- `apps/web/tests/*` (auth route and guard tests)
- `docs/runbooks/local-dev.md`
- `docs/runbooks/deploy.md`

## Acceptance Criteria

1. Unauthenticated access to protected pages redirects to login.
2. Unauthenticated access to protected API endpoints returns `401` with machine-readable error payload.
3. Authenticated operators can complete existing flows (product create/edit, intake save, outtake save, lock/unlock, inventory/history read) without behavior regressions.
4. Session lifecycle is explicit: login creates valid session, logout invalidates it, expired/invalid session is rejected.
5. Tests cover positive and negative auth gates for at least one UI route and one mutation API route.
6. Existing compliance-critical invariants remain enforced:
   - no over-outtake
   - locked transactions immutable without explicit unlock
   - product uniqueness (`name + category + lot`) preserved

## Test Plan

- Unit:
  - Add tests for auth/session validation helpers and guard behavior.
- Integration:
  - Add API route tests for `401` unauthenticated and `2xx` authenticated flows.
  - Add route-level tests for protected-page redirect behavior.
- E2E:
  - Extend smoke flow to include login before core workflow actions.

## Risk Assessment

- Functional risk: High (touches all primary routes).
- Data risk: Medium (auth misconfiguration can block or expose mutation paths).
- Compliance risk: High (unauthorized inventory mutation is a ship blocker).

## Rollback Plan

Revert auth integration changes and restore prior open-access behavior only in non-production/demo environments. If deployed, rotate session secrets and confirm protected endpoints are restored to the last known-good release.
