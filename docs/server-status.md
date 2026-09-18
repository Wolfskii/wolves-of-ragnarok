# Server Status

## Contract

`GameServerAdapter` accepts a normalized query target and returns `ServerStatusResult`. The UI depends only on that result, never directly on GameDig.

The live adapter reads ValheimOne's `/api/status` endpoint for health, world, and population data. It reads `/api/players?token=...` server-side for player names, so the token is never sent to the browser. Player count remains available when the optional authenticated player request fails; the UI states that names are unavailable rather than inventing them.

## Modes

- `SERVER_STATUS_MODE=mock`: deterministic local data, no database or network required
- `SERVER_STATUS_MODE=live`: loads the first enabled server from PostgreSQL, queries ValheimOne, and persists a status snapshot

Live configuration uses `VALHEIM_STATUS_URL`, `VALHEIM_PLAYERS_URL`, `VALHEIM_PLAYERS_TOKEN`, `VALHEIMONE_ADMIN_TOKEN`, `VALHEIM_MAP_URL`, `VALHEIM_JOIN_ADDRESS`, `VALHEIM_JOIN_PORT`, and `VALHEIM_SERVER_PASSWORD`. Keep the ValheimOne tokens and server password in the server environment only. `VALHEIMONE_ADMIN_TOKEN` should match ValheimOne's `AccessToken`; it falls back to `VALHEIM_PLAYERS_TOKEN` for existing deployments. Visitors can read the filtered ValheimOne activity feed and send a server shout using a chosen display name; the name is prefixed to the message and is not an authenticated identity. The password endpoint accepts authenticated `POST` requests only and disables response caching.

The activity panel uses ValheimOne's persisted recent activity feed for joins, leaves, deaths, raids, saves, day changes, and server lifecycle events. It does not expose the raw console log or any admin commands. The left-rail leaderboard reads ValheimOne's `/api/leaderboard` wipe standings (playtime, deaths, and distance) through the site proxy. Anonymous chat is limited by ValheimOne's built-in admin-chat rate limit. Hall chat merges ValheimOne's `/api/chat` feed (Say and Shout, when `MirrorChat` is on) with a 200-message archive in the uploads volume so website and ValheimOne restarts keep the scroll. Website posts still broadcast as a server shout in-game and are shown in the hall as ordinary says under the adventurer name.

Results use an in-memory TTL and single-flight deduplication. `/api/servers/featured/status` exposes the normalized featured status and the homepage polls every 30 seconds.

## Security

Hosts are resolved before querying. Loopback, private, and link-local addresses are blocked unless `SERVER_STATUS_ALLOW_PRIVATE_HOSTS=true`. Keep all server mutations other than the intended chat shout behind ValheimOne's own allowlist and rate limits; the site proxy exposes no console or admin action endpoints.

## Adding a Game

Create another `GameServerAdapter`, normalize all fields, map typed errors, add unit tests for online/offline/timeout behavior, then select it from server configuration. Do not expose protocol-specific raw values to components.
