# Database

PostgreSQL is accessed with Prisma 7, the `prisma-client` generator, and `@prisma/adapter-pg`. Configuration lives in `prisma.config.ts`; the data model is `prisma/schema.prisma`.

## Models

- `User`, `Session`, `UserGame`, `ServerMembership`, `Activity`
- `NewsPost`, `Page`, `SiteSettings`, `HomepageFeature`, `CommunityLink`
- `Server`, `ServerStatusSnapshot`
- `Media`

Roles are `USER`, `MODERATOR`, and `ADMIN`. Publication state is explicit. Authored content uses restrictive deletes; sessions, memberships, snapshots, and activities cascade with their owning record.

## Migrations

The checked-in SQL under `prisma/migrations/` is authoritative. Development changes use `prisma migrate dev`; staging/production use `prisma migrate deploy`. Do not use `db push` against persistent environments.

## Seed

`prisma/seed.ts` is idempotent. It requires environment-provided admin credentials and creates initial settings, pages, news, Discord link, and Valheim server. It never runs automatically in the web container.
