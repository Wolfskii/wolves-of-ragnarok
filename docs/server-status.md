# Server Status

## Contract

`GameServerAdapter` accepts a normalized query target and returns `ServerStatusResult`. The UI depends only on that result, never directly on GameDig.

The first live adapter uses GameDig's `valheim` type. Valheim normally queries game port plus one and only responds when started with `-public 1`. Player count may be available without player names; the UI must state that names are unavailable rather than inventing them.

## Modes

- `SERVER_STATUS_MODE=mock`: deterministic local data, no database or network required
- `SERVER_STATUS_MODE=live`: loads the first enabled server from PostgreSQL, queries it, and persists a status snapshot

Results use an in-memory TTL and single-flight deduplication. `/api/servers/featured/status` exposes the normalized featured status and the homepage polls every 30 seconds.

## Security

Hosts are resolved before querying. Loopback, private, and link-local addresses are blocked unless `SERVER_STATUS_ALLOW_PRIVATE_HOSTS=true`. Keep server mutation admin-only and rate-limit forced refresh behavior before exposing it.

## Adding a Game

Create another `GameServerAdapter`, normalize all fields, map typed errors, add unit tests for online/offline/timeout behavior, then select it from server configuration. Do not expose protocol-specific raw values to components.
