# Deployment

## Docker Compose

Configure `.env` with production values, especially `ORIGIN`, `POSTGRES_PASSWORD`, and a random 32+ character `AUTH_SECRET`.

```sh
docker compose pull
docker compose up --build -d
docker compose ps
```

The `migrate` service applies checked-in migrations and exits before `web` starts. Seeding is never automatic; execute it deliberately for first deployment:

```sh
docker compose run --rm -e ADMIN_EMAIL -e ADMIN_USERNAME -e ADMIN_PASSWORD migrate npm run db:seed
```

## Reverse Proxy

The production Compose file exposes the web process internally on container port `3000` and attaches it to Dokploy's external `dokploy-network`; it intentionally does not publish host port `3000`. Configure the Dokploy application/proxy target to container port `3000`. PostgreSQL is internal-only. This avoids collisions with other Dokploy projects already using host port `3000`.

For local browser development, use `npm run dev`; do not add a production host-port mapping to the Dokploy Compose file. Terminate TLS in Caddy, Nginx, or Traefik and forward host/protocol headers. `PROTOCOL_HEADER` and `HOST_HEADER` must only be enabled behind a trusted proxy. Set `ADDRESS_HEADER` and `XFF_DEPTH` to the known proxy topology before using client IPs for rate limiting.

## Persistence

Back up both named volumes:

- `postgres-data`: database records and sessions
- `uploads`: CMS-uploaded media

Use `pg_dump` for consistent database backups and separately archive uploads. Test restoration before relying on a backup policy.

## Health and Networking

`GET /health` is the liveness endpoint. Live GameDig queries require outbound UDP and response traffic; some VPS and container firewalls block it. Keep mock mode available while diagnosing network policy.

## Rollback

Deploy immutable image tags. Application rollback is safe only when the previous application version remains compatible with already-applied migrations. Prefer additive migrations and staged column removal.
