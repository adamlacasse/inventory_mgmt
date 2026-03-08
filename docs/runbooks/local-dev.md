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
```

## Auth Configuration

After copying `.env.example` to `.env.local`, set a strong `SESSION_SECRET` (minimum 32 characters):

```bash
openssl rand -hex 32
# Paste the output as SESSION_SECRET in apps/web/.env.local
```

Local development seed credentials (do not use in staging or production):

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `admin-change-me` | admin |
| `operator@example.com` | `operator-change-me` | operator |

## Optional Demo Seed

```bash
pnpm --filter @inventory/db db:seed
```

## Non-Destructive User Bootstrap Seed

```bash
BOOTSTRAP_ADMIN_EMAIL='admin@example.com' \
BOOTSTRAP_ADMIN_PASSWORD='admin-change-me' \
BOOTSTRAP_OPERATOR_EMAIL='operator@example.com' \
BOOTSTRAP_OPERATOR_PASSWORD='operator-change-me' \
pnpm --filter @inventory/db db:seed:upsert
```

## Run App

```bash
pnpm dev
```

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
