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

Web binds to `127.0.0.1:3000`. Terminate TLS in Caddy, Nginx, or Traefik and forward host/protocol headers. `PROTOCOL_HEADER` and `HOST_HEADER` must only be enabled behind a trusted proxy. Set `ADDRESS_HEADER` and `XFF_DEPTH` to the known proxy topology before using client IPs for rate limiting.

## Persistence

Back up both named volumes:

- `postgres-data`: database records and sessions
- `uploads`: CMS-uploaded media

Use `pg_dump` for consistent database backups and separately archive uploads. Test restoration before relying on a backup policy.

## Health and Networking

`GET /health` is the liveness endpoint. Live GameDig queries require outbound UDP and response traffic; some VPS and container firewalls block it. Keep mock mode available while diagnosing network policy.

## Rollback

Deploy immutable image tags. Application rollback is safe only when the previous application version remains compatible with already-applied migrations. Prefer additive migrations and staged column removal.
