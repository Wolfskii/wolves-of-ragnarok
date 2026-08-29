# AGENTS.md

## Project Shape

This is one root SvelteKit application. Public SSR pages, form actions, API endpoints, administration, and game-server queries all live under `src/`. Do not split it into a frontend/backend monorepo without an explicit architectural decision.

- `src/routes/`: public, authenticated, admin, and API routes
- `src/lib/components/fantasy/`: public ornate UI primitives
- `src/lib/server/`: database, auth, media, CMS, and server integrations
- `src/generated/prisma/`: generated and ignored; never edit manually
- `prisma/`: schema, checked-in migrations, environment-driven seed
- `static/images/`: canonical bundled art; CMS uploads belong in `uploads/`
- `docs/`: architecture and operator guidance

## Conventions

Use strict TypeScript and Svelte 5 runes. Keep browser code free of Prisma, filesystem, secrets, and GameDig imports. Prefer SvelteKit server actions for mutations and endpoints only for machine/polling contracts. Validate untrusted input with Zod. Preserve semantic HTML beneath decorative layers.

Use plain CSS and the tokens in `src/lib/styles/tokens.css`. Public components may be ornate; admin components should prioritize repeated operational work. Do not introduce Tailwind or replace the visual system casually.

## Required Checks

Run after relevant changes:

```sh
npm run check
npm run test:unit -- --run
npm run build
npx playwright test tests/homepage.e2e.ts
```

Use `npm run lint` before handoff. Database changes also require `npx prisma validate`, `npm run db:generate`, and a checked-in migration.

## Authentication

Authentication uses Argon2id passwords and opaque random cookie tokens. Only an HMAC-SHA256 token hash is stored. Cookies are `httpOnly`, `sameSite=lax`, and secure outside development. Authorization is always server-side. Never replace this with frontend state or expose password/session fields in load data.

Admin routes require `ADMIN`. Keep last-admin/self-lockout protections when user management is implemented. Password changes revoke all sessions and issue one new session.

## Database and Seed

Prisma 7 uses the `prisma-client` generator and `@prisma/adapter-pg`. The seed must remain idempotent and must obtain admin credentials from environment variables. Never add production credentials to source.

## Server Integrations

Implement adapters under `src/lib/server/server-status/` against `GameServerAdapter`. Normalize external responses to `ServerStatusResult`; UI must not consume GameDig-specific fields. Validate DNS targets and block private/loopback/link-local addresses unless explicitly allowed by deployment configuration. Add tests for every adapter.

## Artwork

The supplied logo and character/environment images are canonical assets. Do not repaint, regenerate, crop destructively, or replace them casually. Record new artwork origin and license in `docs/artwork.md`. Keep decorative images empty-alt when nearby HTML conveys meaning. Live data and form controls must remain HTML, never baked into raster art.

The intended design is a rebuilt 2008-2013 fantasy guild portal, not a modern SaaS page and not intentionally poor legacy UX. Preserve the narrow portal silhouette, large environmental margins, asymmetric modules, ornate frames, readable typography, responsive stacking, and keyboard accessibility.

## Deployment

The production target is adapter-node in Docker Compose behind a trusted TLS reverse proxy. Migrations run in the one-shot `migrate` service before `web`. Do not expose PostgreSQL publicly. Preserve named volumes and document backup/restore changes.

## Do Not Change Casually

- Session token format, hashing parameters, or cookie policy
- Prisma relation deletion behavior or migration history
- Reserved public/admin route structure
- Game query target protections
- Canonical artwork filenames and directory roles
- Forwarded-header trust settings
- Local upload traversal/type/size safeguards
