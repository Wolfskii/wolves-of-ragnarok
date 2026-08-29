# Wolves of Ragnarok

A full-stack Norse fantasy gaming community portal built with SvelteKit, TypeScript, PostgreSQL, Prisma, and Docker.

The public interface recreates the atmosphere of late-2000s guild websites with modern responsive HTML, accessibility, server-side authorization, and maintainable component boundaries.

## Requirements

- Node.js 22+
- npm 10+
- PostgreSQL 17 or Docker Desktop

## Local Setup

```sh
npm install
cp .env.example .env
docker compose up -d postgres
npm run db:deploy
npm run db:seed
npm run dev
```

Admin credentials are read from `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` only when `npm run db:seed` is explicitly executed.

## Commands

```sh
npm run dev          # development server
npm run check        # Svelte and TypeScript diagnostics
npm run lint         # formatting and ESLint
npm run test:unit    # Vitest
npm run test:e2e     # Playwright production-preview tests
npm run build        # adapter-node production build
npm run db:generate  # regenerate Prisma client
npm run db:migrate   # create/apply development migration
npm run db:deploy    # apply checked-in migrations
npm run db:seed      # idempotent initial content/admin seed
```

## Docker

Set at minimum `POSTGRES_PASSWORD`, `AUTH_SECRET`, and `ORIGIN`, then run:

```sh
docker compose up --build -d
```

The production app exposes container port 3000 to Dokploy's reverse proxy through the shared `dokploy-network` and does not bind host port 3000. PostgreSQL is internal-only. Production data lives in named `postgres-data` and `uploads` volumes.

See [docs/development.md](docs/development.md), [docs/deployment.md](docs/deployment.md), and [AGENTS.md](AGENTS.md) before changing architecture or security behavior.
