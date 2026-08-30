import type { GameServerAdapter, ServerQueryTarget, ServerStatusResult } from './types';

export type ValheimOneConfig = {
	statusUrl: string;
	playersUrl: string;
	playersToken: string;
	mapUrl: string;
	joinAddress: string;
	joinPort: number;
};

type StatusPayload = {
	serverName?: unknown;
	worldName?: unknown;
	gameVersion?: unknown;
	serverVersion?: unknown;
	pluginVersion?: unknown;
	players?: unknown;
	maxPlayers?: unknown;
	day?: unknown;
	snapshotAgeMs?: unknown;
	map?: unknown;
};

type PlayersPayload = {
	players?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

function asString(value: unknown): string | null {
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function playersUrlWithToken(url: string, token: string): string {
	if (!token) return url;
	const authenticatedUrl = new URL(url);
	authenticatedUrl.searchParams.set('token', token);
	return authenticatedUrl.toString();
}

function versionedMapUrl(mapUrl: string, path: string, map: unknown): string {
	const assetUrl = new URL(path, mapUrl);
	if (isRecord(map)) {
		const revision = asString(map.renderRevision);
		if (revision) assetUrl.searchParams.set('v', revision);
	}
	return assetUrl
		.toString()
		.replaceAll('%7Bz%7D', '{z}')
		.replaceAll('%7Bx%7D', '{x}')
		.replaceAll('%7By%7D', '{y}');
}

async function fetchJson<T>(url: string, timeoutMs: number): Promise<T> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: { accept: 'application/json' }
		});
		if (!response.ok) throw new Error('QUERY_FAILED');
		return (await response.json()) as T;
	} catch (error) {
		if (error instanceof Error && error.message === 'QUERY_FAILED') throw error;
		throw new Error('UNREACHABLE', { cause: error });
	} finally {
		clearTimeout(timeout);
	}
}

function errorResult(
	target: ServerQueryTarget,
	config: ValheimOneConfig,
	errorCode: 'UNREACHABLE' | 'QUERY_FAILED'
): ServerStatusResult {
	return {
		serverId: target.id,
		name: target.name,
		joinAddress: config.joinAddress,
		joinPort: config.joinPort,
		mapUrl: config.mapUrl,
		mapImageUrl: null,
		mapTileUrl: null,
		mapMaxZoom: null,
		state: 'error',
		playerCount: null,
		maxPlayers: null,
		playerNames: [],
		pingMs: null,
		worldName: null,
		version: null,
		day: null,
		snapshotAgeMs: null,
		queriedAt: new Date().toISOString(),
		errorCode
	};
}

export class ValheimOneAdapter implements GameServerAdapter {
	constructor(private readonly config: ValheimOneConfig) {}

	async query(target: ServerQueryTarget): Promise<ServerStatusResult> {
		let status: StatusPayload;
		try {
			const payload = await fetchJson<unknown>(this.config.statusUrl, target.timeoutMs);
			if (!isRecord(payload)) throw new Error('QUERY_FAILED');
			status = payload as StatusPayload;
		} catch (error) {
			const errorCode =
				error instanceof Error && error.message === 'UNREACHABLE' ? 'UNREACHABLE' : 'QUERY_FAILED';
			return errorResult(target, this.config, errorCode);
		}

		let playerNames: string[] = [];
		try {
			const payload = await fetchJson<PlayersPayload>(
				playersUrlWithToken(this.config.playersUrl, this.config.playersToken),
				target.timeoutMs
			);
			if (Array.isArray(payload.players)) {
				playerNames = payload.players
					.filter(isRecord)
					.map((player) => asString(player.name))
					.filter((name): name is string => Boolean(name));
			}
		} catch {
			// Status remains useful when the optional authenticated player feed is unavailable.
		}

		return {
			serverId: target.id,
			name: asString(status.serverName) ?? target.name,
			joinAddress: this.config.joinAddress,
			joinPort: this.config.joinPort,
			mapUrl: this.config.mapUrl,
			mapImageUrl: versionedMapUrl(this.config.mapUrl, '/base.png', status.map),
			mapTileUrl: versionedMapUrl(this.config.mapUrl, '/tiles/{z}/{x}-{y}.png', status.map),
			mapMaxZoom: isRecord(status.map) ? asNumber(status.map.maxZoom) : null,
			state: 'online',
			playerCount: asNumber(status.players),
			maxPlayers: asNumber(status.maxPlayers),
			playerNames,
			pingMs: null,
			worldName: asString(status.worldName),
			version:
				asString(status.gameVersion) ??
				asString(status.serverVersion) ??
				asString(status.pluginVersion),
			day: asNumber(status.day),
			snapshotAgeMs: asNumber(status.snapshotAgeMs),
			queriedAt: new Date().toISOString()
		};
	}
}
