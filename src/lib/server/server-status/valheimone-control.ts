import { env } from '$env/dynamic/private';
import { mergeAndPersistChatArchive, loadChatArchive } from './chat-archive';
import { mergeChatHistories, presentWebsiteChats } from './chat-history';

export type ValheimActivityEvent = {
	id: number;
	unixMs: number;
	type: string;
	data: Record<string, unknown>;
};

export type ValheimChatMessage = {
	sequence: number;
	playerName: string;
	text: string;
	shout: boolean;
	unixMs: number;
};

export type ValheimLeaderboardPlayer = {
	name: string;
	playSeconds: number;
	deaths: number;
	distanceMeters: number;
	online: boolean;
};

export class ValheimOneControlError extends Error {
	constructor(
		public readonly status: number,
		message = 'ValheimOne control request failed'
	) {
		super(message);
		this.name = 'ValheimOneControlError';
	}
}

const activityTypes = new Set([
	'day.change',
	'player.death',
	'player.join',
	'player.leave',
	'raid.end',
	'raid.start',
	'server.start',
	'server.stop',
	'world.save'
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

function controlToken(): string {
	return (env.VALHEIMONE_ADMIN_TOKEN ?? env.VALHEIM_PLAYERS_TOKEN ?? '').trim();
}

function apiUrl(path: string): string {
	const base = (env.VALHEIM_MAP_URL ?? 'https://valheim-map.webble.se').replace(/\/+$/, '');
	return new URL(path, `${base}/`).toString();
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
	const token = controlToken();
	if (!token) throw new ValheimOneControlError(503, 'ValheimOne access is not configured');

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);
	try {
		const response = await fetch(apiUrl(path), {
			...init,
			signal: controller.signal,
			headers: {
				accept: 'application/json',
				'x-livemap-token': token,
				...(init.headers ?? {})
			}
		});
		if (!response.ok) throw new ValheimOneControlError(response.status);
		return response;
	} catch (error) {
		if (error instanceof ValheimOneControlError) throw error;
		throw new ValheimOneControlError(503, 'ValheimOne is unreachable');
	} finally {
		clearTimeout(timeout);
	}
}

function asActivityEvent(value: unknown): ValheimActivityEvent | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== 'number' || typeof value.unixMs !== 'number') return null;
	if (typeof value.type !== 'string' || !activityTypes.has(value.type)) return null;
	return {
		id: value.id,
		unixMs: value.unixMs,
		type: value.type,
		data: isRecord(value.data) ? value.data : {}
	};
}

function asChatMessage(value: unknown): ValheimChatMessage | null {
	if (!isRecord(value)) return null;
	if (typeof value.sequence !== 'number' || typeof value.unixMs !== 'number') return null;
	if (typeof value.playerName !== 'string' || typeof value.text !== 'string') return null;
	return {
		sequence: value.sequence,
		playerName: value.playerName,
		text: value.text,
		shout: value.shout === true,
		unixMs: value.unixMs
	};
}

async function liveChatMessages(): Promise<ValheimChatMessage[]> {
	const chatResponse = await request('/api/chat');
	const chatPayload = (await chatResponse.json()) as unknown;
	return isRecord(chatPayload) && Array.isArray(chatPayload.chats)
		? chatPayload.chats
				.map(asChatMessage)
				.filter((chat): chat is ValheimChatMessage => chat !== null)
		: [];
}

export async function getValheimActivity(cursor: number | null) {
	const activityUrl = new URL(apiUrl('/api/activity'));
	if (cursor !== null) activityUrl.searchParams.set('cursor', String(cursor));

	try {
		const [activityResponse, liveChats] = await Promise.all([
			request(activityUrl.pathname + activityUrl.search),
			liveChatMessages().catch(() => [] as ValheimChatMessage[])
		]);
		const activityPayload = (await activityResponse.json()) as unknown;
		const chats = presentWebsiteChats(
			await mergeAndPersistChatArchive(liveChats).catch(async () =>
				mergeChatHistories(await loadChatArchive(), liveChats)
			)
		);

		return {
			enabled: isRecord(activityPayload) && activityPayload.enabled === true,
			cursor:
				isRecord(activityPayload) && typeof activityPayload.cursor === 'number'
					? activityPayload.cursor
					: (cursor ?? 0),
			events:
				isRecord(activityPayload) && Array.isArray(activityPayload.events)
					? activityPayload.events
							.map(asActivityEvent)
							.filter((event): event is ValheimActivityEvent => event !== null)
					: [],
			chats
		};
	} catch (error) {
		const chats = presentWebsiteChats(await loadChatArchive());
		if (chats.length === 0) throw error;
		return {
			enabled: false,
			cursor: cursor ?? 0,
			events: [],
			chats
		};
	}
}

function asLeaderboardPlayer(value: unknown): ValheimLeaderboardPlayer | null {
	if (!isRecord(value)) return null;
	if (typeof value.name !== 'string' || !value.name.trim()) return null;
	const playSeconds = Number(value.playSeconds);
	const deaths = Number(value.deaths);
	const distanceMeters = Number(value.distanceMeters);
	if (!Number.isFinite(playSeconds) || playSeconds < 0) return null;
	if (!Number.isFinite(deaths) || deaths < 0) return null;
	if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return null;
	return {
		name: value.name.trim(),
		playSeconds: Math.floor(playSeconds),
		deaths: Math.floor(deaths),
		distanceMeters,
		online: value.online === true
	};
}

export async function getValheimLeaderboard(): Promise<ValheimLeaderboardPlayer[]> {
	const response = await request('/api/leaderboard');
	const payload = (await response.json()) as unknown;
	return isRecord(payload) && Array.isArray(payload.players)
		? payload.players
				.map(asLeaderboardPlayer)
				.filter((player): player is ValheimLeaderboardPlayer => player !== null)
				.slice(0, 50)
		: [];
}

export async function sendValheimChat(text: string, operatorName: string): Promise<void> {
	await request('/api/admin/chat', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-operator': operatorName
		},
		body: JSON.stringify({ text })
	});
}
