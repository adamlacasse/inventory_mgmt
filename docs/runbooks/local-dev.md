# Local Development Runbook

## Prerequisites

- Node.js 22+
- Corepack enabled

## Setup

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
BOOTSTRAP_ADMIN_EMAIL='admin@example.com' \
BOOTSTRAP_ADMIN_PASSWORD='admin-change-me' \
BOOTSTRAP_OPERATOR_EMAIL='operator@example.com' \
BOOTSTRAP_OPERATOR_PASSWORD='operator-change-me' \
pnpm --filter @inventory/db db:seed:upsert
```

## Auth Configuration

After copying `.env.example` to `.env.local`, set a strong `SESSION_SECRET` (minimum 32 characters):

```bash
openssl rand -hex 32
# Paste the output as SESSION_SECRET in apps/web/.env.local
```

Local development bootstrap credentials after running the bootstrap step above (do not use in staging or production):

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `admin-change-me` | admin |
| `operator@example.com` | `operator-change-me` | operator |

## Optional Demo Seed

This adds products plus intake/outtake history on top of the bootstrap users:

```bash
pnpm --filter @inventory/db db:seed
```

## Run App

```bash
pnpm dev
```

## Local Architecture

If you are used to a Vite React app plus a separate Node proxy, the closest mapping in this repo is:

- `pnpm dev` at the repo root runs `pnpm --filter @inventory/web dev`, which starts `next dev`.
- That single Next.js process serves both the UI in `apps/web/app` and the API routes in `apps/web/app/api`.
- There is no separate local proxy server for normal development.
- The database is the only separately prepared dependency: Prisma targets the local SQLite/libSQL database under `packages/db/prisma/dev.db` after migrations and client generation.

The production-style local flow is still available, but it is also a single app process:

```bash
pnpm build
pnpm --filter @inventory/web start
```

That is the closest equivalent to a "full stack" local run in a Vite plus proxy setup.

## Request Flow

High-level request flow in local development:

```text
Browser
  -> Next.js app routes in apps/web/app
  -> route handlers in apps/web/app/api or server-rendered page code
  -> server composition in apps/web/src/server
  -> domain logic in packages/domain
  -> Prisma client in apps/web/src/server/prisma.ts
  -> SQLite/libSQL database in packages/db/prisma/dev.db
```

In practical terms:

- A page request such as `/products` is handled by the Next app in `apps/web/app/products/page.tsx`.
- A client mutation such as `POST /api/outtake` is handled by a Next route handler in `apps/web/app/api/outtake/route.ts`.
- Auth, RBAC, service composition, and database access live in `apps/web/src/server`.
- Business rules and validation live in `packages/domain`.
- Prisma reads and writes the local database prepared by the `@inventory/db` package scripts.

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm db:migrate:status
```

For release sequencing and go/no-go blockers, see `docs/runbooks/deploy.md`.

## Smoke Workflow (Manual)

0. Navigate to `/products` — confirm redirect to `/login`. Log in with a seed user.
1. Open `/products` and create at least one product.
2. Open `/intake` and save an intake transaction.
3. Open `/outtake` and save an outtake transaction.
4. Open `/inventory` and verify net units on hand.
5. Open `/history`, unlock and relock a transaction.
6. Download `/api/reports/inventory` and verify CSV columns.
7. Click "Sign Out" — confirm redirect to `/login`.
