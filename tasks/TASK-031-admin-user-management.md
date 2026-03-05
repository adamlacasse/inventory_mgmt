# TASK-031: Admin User Management

## Context

With role-based authorization in place (TASK-029), admins need a UI and API to manage users — creating accounts, assigning roles, and deactivating users — so the seed script is no longer the only path to provisioning access.

## Scope

- In scope:
  - `GET /api/admin/users` — list all users (admin only).
  - `POST /api/admin/users` — create a user with email, name, password, and role (admin only).
  - `PATCH /api/admin/users/[id]` — update name, role, and/or password (admin only); cannot demote the last admin.
  - `DELETE /api/admin/users/[id]` — deactivate a user by setting `active = false` (admin only); cannot deactivate self or last admin.
  - Schema: add `active Boolean @default(true)` to `User` model; filter inactive users out of login.
  - Admin UI page at `/admin/users` — list, add, edit role, deactivate.
  - Server module `apps/web/src/server/users.ts` with all DB logic.
- Out of scope:
  - Password reset / self-service flows.
  - Email notifications.
  - Audit log for user management actions (future task).

## Files To Touch

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/<timestamp>_add_user_active/migration.sql`
- `apps/web/src/server/users.ts` (new)
- `apps/web/src/server/users.test.ts` (new)
- `apps/web/app/api/admin/users/route.ts` (new)
- `apps/web/app/api/admin/users/[id]/route.ts` (new)
- `apps/web/app/api/auth/login/route.ts` (filter inactive users)
- `apps/web/app/admin/users/page.tsx` (new)
- `apps/web/app/globals.css` (admin table styles)

## Acceptance Criteria

1. `GET /api/admin/users` returns all users; non-admins receive 403.
2. `POST /api/admin/users` creates a bcrypt-hashed user; duplicate email returns 409.
3. `PATCH /api/admin/users/[id]` updates name/role/password; demoting the last admin returns 409.
4. `DELETE /api/admin/users/[id]` sets `active = false`; deactivating self or the last admin returns 409.
5. Login rejects inactive users with the same generic 401 as wrong password.
6. `/admin/users` page is accessible only to admins (redirects others to `/`).
7. UI lists users with name, email, role, and active status; supports add, edit-role, and deactivate actions.

## Test Plan

- Unit:
  - `users.test.ts`: create, list, update role, deactivate, last-admin guard, inactive login guard.
- Integration:
  - API routes covered by unit tests via mocked prisma.
- E2E:
  - N/A (existing smoke suite covers auth flow).

## Risk Assessment

- Functional risk: Medium (last-admin guard prevents lockout).
- Data risk: Low (soft-delete only, no data removed).
- Compliance risk: Low.

## Rollback Plan

Revert schema migration, remove `apps/web/app/api/admin/` and `apps/web/app/admin/` directories, remove `users.ts` server module, revert login route change.
