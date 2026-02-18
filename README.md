# Cannabis Inventory Management System

Monorepo scaffold for a cannabis inventory platform with a lead engineer + AI agent workflow.

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
pnpm dev
```

See [the local runbook](./docs/runbooks/local-dev.md) for details.
