# Server Status

## Contract

`GameServerAdapter` accepts a normalized query target and returns `ServerStatusResult`. The UI depends only on that result, never directly on GameDig.

The live adapter reads ValheimOne's `/api/status` endpoint for health, world, and population data. It reads `/api/players?token=...` server-side for player names, so the token is never sent to the browser. Player count remains available when the optional authenticated player request fails; the UI states that names are unavailable rather than inventing them.

## Modes

- `SERVER_STATUS_MODE=mock`: deterministic local data, no database or network required
- `SERVER_STATUS_MODE=live`: loads the first enabled server from PostgreSQL, queries ValheimOne, and persists a status snapshot

Live configuration uses `VALHEIM_STATUS_URL`, `VALHEIM_PLAYERS_URL`, `VALHEIM_PLAYERS_TOKEN`, `VALHEIM_MAP_URL`, `VALHEIM_JOIN_ADDRESS`, `VALHEIM_JOIN_PORT`, and `VALHEIM_SERVER_PASSWORD`. Keep the player token and server password in the server environment only. The password endpoint accepts authenticated `POST` requests only and disables response caching.

Results use an in-memory TTL and single-flight deduplication. `/api/servers/featured/status` exposes the normalized featured status and the homepage polls every 30 seconds.

## Security

Hosts are resolved before querying. Loopback, private, and link-local addresses are blocked unless `SERVER_STATUS_ALLOW_PRIVATE_HOSTS=true`. Keep server mutation admin-only and rate-limit forced refresh behavior before exposing it.

## Adding a Game

Create another `GameServerAdapter`, normalize all fields, map typed errors, add unit tests for online/offline/timeout behavior, then select it from server configuration. Do not expose protocol-specific raw values to components.
