import { env } from '$env/dynamic/private';
import { getDatabase } from '$lib/server/db';
import { ValheimGameDigAdapter } from './gamedig';
import { MockServerAdapter } from './mock';
import type { ServerQueryTarget, ServerStatusResult } from './types';

const cache = new Map<string, { result: ServerStatusResult; expiresAt: number }>();
const pending = new Map<string, Promise<ServerStatusResult>>();

const mockTarget: ServerQueryTarget = {
	id: 'featured-valheim',
	name: "The Wolves' Den",
	host: 'valheim.example.com',
	gamePort: 2456,
	queryPort: 2457,
	timeoutMs: 3000
};

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
		mode === 'mock'
			? new MockServerAdapter()
			: new ValheimGameDigAdapter(env.SERVER_STATUS_ALLOW_PRIVATE_HOSTS === 'true');
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

	const server = await getDatabase().server.findFirst({
		where: { enabled: true },
		orderBy: { displayOrder: 'asc' }
	});
	if (!server) {
		return {
			...mockTarget,
			state: 'offline',
			playerCount: 0,
			maxPlayers: 0,
			playerNames: [],
			pingMs: null,
			worldName: null,
			version: null,
			queriedAt: new Date().toISOString(),
			serverId: mockTarget.id
		};
	}

	const result = await querySingleFlight(
		{
			id: server.id,
			name: server.name,
			host: server.host,
			gamePort: server.gamePort,
			queryPort: server.queryPort,
			timeoutMs: server.queryTimeoutMs
		},
		mode
	);

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
	return result;
}
