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
DATABASE_URL=file:./dev.db
EOF
pnpm --filter @inventory/db db:migrate:dev
pnpm --filter @inventory/db db:generate
```

## Optional Demo Seed

```bash
pnpm --filter @inventory/db db:seed
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

## Smoke Workflow (Manual)

1. Open `/products` and create at least one product.
2. Open `/intake` and save an intake transaction.
3. Open `/outtake` and save an outtake transaction.
4. Open `/inventory` and verify net units on hand.
5. Open `/history`, unlock and relock a transaction.
6. Download `/api/reports/inventory` and verify CSV columns.
