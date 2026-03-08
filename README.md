# Organizize

Monorepo scaffold for the Organizize inventory management platform with a lead engineer + AI agent workflow.

## Current State

Current branch status as of March 8, 2026:

- Core inventory MVP flows are implemented: products, intake, outtake, inventory, history, CSV export.
- Auth, RBAC, admin user management, branding/navigation, and low-stock alerts are implemented.
- Quality gates currently pass from repo root:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm db:migrate:status`

Current planning and handoff sources of truth:

- `docs/product/backlog.md` for shipped vs remaining scope
- `docs/runbooks/local-dev.md` for local bootstrap
- `docs/runbooks/deploy.md` for release/deploy procedure
- `tasks/` for implementation-scoped work items

## Workspace Layout

- `apps/web`: Next.js application (UI + API routes)
- `packages/domain`: Business rules and validation logic
- `packages/db`: Prisma schema, migrations, and seeds
- `packages/ui`: Shared UI components
- `docs/product`: Product docs and backlog
- `docs/architecture`: ADRs, ownership, and design notes
- `docs/runbooks`: Operational playbooks
- `tasks`: Agent-ready task files with acceptance criteria

## Engineering Workflow

1. Create a task in `tasks/` from `tasks/TASK_TEMPLATE.md`.
2. Limit each task to one bounded change.
3. Implement with tests in the touched module.
4. Run quality gates before opening a PR.

## Quality Gates

Run from repo root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm db:migrate:status
```

## Local Setup

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install
cp apps/web/.env.example apps/web/.env.local
cat <<'EOF' > packages/db/.env
DATABASE_URL=file:./prisma/dev.db
EOF
pnpm --filter @inventory/db db:migrate:deploy
pnpm --filter @inventory/db db:generate
pnpm dev
```

See [the local runbook](./docs/runbooks/local-dev.md) for details.
