import { env } from '$env/dynamic/private';
import { getDatabase } from '$lib/server/db';
import { MockServerAdapter } from './mock';
import type { ServerQueryTarget, ServerStatusResult } from './types';
import { ValheimOneAdapter, type ValheimOneConfig } from './valheimone';

const cache = new Map<string, { result: ServerStatusResult; expiresAt: number }>();
const pending = new Map<string, Promise<ServerStatusResult>>();

const mockTarget: ServerQueryTarget = {
	id: 'featured-valheim',
	name: 'Yggdrasil',
	host: env.VALHEIM_JOIN_ADDRESS ?? 'valheim.webble.se',
	gamePort: 2456,
	queryPort: null,
	timeoutMs: 3000
};

function valheimOneConfig(): ValheimOneConfig {
	const joinPort = Number(env.VALHEIM_JOIN_PORT ?? 2456);
	return {
		statusUrl: env.VALHEIM_STATUS_URL ?? 'https://valheim-map.webble.se/api/status',
		playersUrl: env.VALHEIM_PLAYERS_URL ?? 'https://valheim-map.webble.se/api/players',
		playersToken: env.VALHEIM_PLAYERS_TOKEN ?? '',
		mapUrl: env.VALHEIM_MAP_URL ?? 'https://valheim-map.webble.se',
		joinAddress: env.VALHEIM_JOIN_ADDRESS ?? 'valheim.webble.se',
		joinPort: Number.isInteger(joinPort) && joinPort > 0 && joinPort <= 65535 ? joinPort : 2456
	};
}

function cacheSeconds() {
	const parsed = Number(env.SERVER_STATUS_CACHE_SECONDS ?? 30);
	return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 5), 600) : 30;
}

async function querySingleFlight(target: ServerQueryTarget, mode: 'mock' | 'live') {
	const cached = cache.get(target.id);
	if (cached && cached.expiresAt > Date.now()) return cached.result;

	const existing = pending.get(target.id);
	if (existing) return existing;

	const adapter =
		mode === 'mock' ? new MockServerAdapter() : new ValheimOneAdapter(valheimOneConfig());
	const query = adapter.query(target).then((result) => {
		cache.set(target.id, { result, expiresAt: Date.now() + cacheSeconds() * 1000 });
		pending.delete(target.id);
		return result;
	});
	pending.set(target.id, query);
	return query;
}

export async function getFeaturedServerStatus(): Promise<ServerStatusResult> {
	const mode = env.SERVER_STATUS_MODE === 'live' ? 'live' : 'mock';
	if (mode === 'mock') return querySingleFlight(mockTarget, mode);

	const config = valheimOneConfig();
	const server = await getDatabase().server.findFirst({
		where: { enabled: true },
		orderBy: { displayOrder: 'asc' }
	});

	const result = await querySingleFlight(
		server
			? {
					id: server.id,
					name: server.name,
					host: config.joinAddress,
					gamePort: config.joinPort,
					queryPort: null,
					timeoutMs: server.queryTimeoutMs
				}
			: { ...mockTarget, host: config.joinAddress, gamePort: config.joinPort },
		mode
	);

	if (server) {
		await getDatabase().serverStatusSnapshot.create({
			data: {
				serverId: server.id,
				online: result.state === 'online',
				playerCount: result.playerCount,
				maxPlayers: result.maxPlayers,
				playerNames: result.playerNames,
				pingMs: result.pingMs,
				worldName: result.worldName,
				version: result.version,
				errorCode: result.errorCode
			}
		});
	}
	return result;
}
