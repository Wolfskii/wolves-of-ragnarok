# Development

## Setup

Copy `.env.example` to `.env`, choose a strong local database password and auth secret, then start PostgreSQL and apply migrations.

```sh
npm install
docker compose up -d postgres
npm run db:deploy
npm run db:seed
npm run dev
```

`SERVER_STATUS_MODE=mock` provides deterministic status data without contacting a real game server.

## Quality Checks

```sh
npm run check
npm run lint
npm run test:unit -- --run
npm run build
npx playwright test tests/homepage.e2e.ts
```

Install Playwright Chromium once with `npx playwright install chromium`.

## Database Changes

Edit `prisma/schema.prisma`, then run:

```sh
npx prisma validate
npm run db:generate
npm run db:migrate -- --name descriptive_change
```

Review generated SQL before committing it. Never rewrite migration history after deployment.

## Generated Code

`src/generated/prisma/` is ignored and recreated by `npm run db:generate`. Do not edit it manually.
