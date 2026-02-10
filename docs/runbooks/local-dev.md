# Local Development Runbook

## Prerequisites

- Node.js 22+
- Corepack enabled

## Setup

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install
cp .env.example .env
```

## Common Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm db:migrate:status
```
