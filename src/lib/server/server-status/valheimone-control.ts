import { env } from '$env/dynamic/private';
import { mergeAndPersistChatArchive, loadChatArchive } from './chat-archive';
import { mergeChatHistories, presentWebsiteChats } from './chat-history';
import { loadChronicleArchive, persistChronicle } from './chronicle-archive';
import { chronicleSince } from './chronicle';

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
	return (env.VALHEIMONE_ADMIN_TOKEN?.trim() || env.VALHEIM_PLAYERS_TOKEN?.trim() || '').trim();
}

function mapOrigins(): string[] {
	const primary = (env.VALHEIM_MAP_URL?.trim() || 'https://valheim-map.webble.se').replace(
		/\/+$/,
		''
	);
	const internal = (env.VALHEIM_MAP_INTERNAL_URL ?? '').trim().replace(/\/+$/, '');
	if (!internal || internal === primary) return [primary];
	return [primary, internal];
}

function apiUrl(origin: string, path: string): string {
	return new URL(path, `${origin}/`).toString();
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
	const token = controlToken();
	const method = (init.method ?? 'GET').toUpperCase();
	if (method !== 'GET' && !token) {
		throw new ValheimOneControlError(503, 'ValheimOne access is not configured');
	}

	const origins = mapOrigins();
	let lastStatus = 503;
	for (let index = 0; index < origins.length; index++) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		try {
			const response = await fetch(apiUrl(origins[index] ?? '', path), {
				...init,
				signal: controller.signal,
				headers: {
					accept: 'application/json',
					...(token ? { 'x-livemap-token': token } : {}),
					...(init.headers ?? {})
				}
			});
			if (response.ok) return response;
			lastStatus = response.status;
			await response.body?.cancel().catch(() => undefined);
			if (response.status < 500 || index === origins.length - 1) {
				throw new ValheimOneControlError(response.status);
			}
		} catch (error) {
			if (error instanceof ValheimOneControlError) throw error;
			if (index === origins.length - 1) {
				throw new ValheimOneControlError(503, 'ValheimOne is unreachable');
			}
		} finally {
			clearTimeout(timeout);
		}
	}

	throw new ValheimOneControlError(lastStatus, 'ValheimOne is unreachable');
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

async function savedChronicle(cursor: number | null): Promise<{
	cursor: number;
	events: ValheimActivityEvent[];
}> {
	const archive = await loadChronicleArchive().catch(() => ({
		valheimCursor: 0,
		events: [] as ValheimActivityEvent[]
	}));
	return {
		cursor: archive.events.at(-1)?.id ?? cursor ?? 0,
		events: chronicleSince(archive.events, cursor)
	};
}

async function collectLiveActivity(): Promise<{
	enabled: boolean;
	valheimCursor: number;
	events: ValheimActivityEvent[];
}> {
	const archive = await loadChronicleArchive().catch(() => ({
		valheimCursor: 0,
		events: [] as ValheimActivityEvent[]
	}));
	let valheimCursor = archive.valheimCursor;
	let enabled = false;
	const events: ValheimActivityEvent[] = [];
	for (let page = 0; page < 50; page += 1) {
		const payload = (await request(
			`/api/activity?cursor=${encodeURIComponent(String(valheimCursor))}&order=asc`
		).then((response) => response.json())) as unknown;
		if (!isRecord(payload)) break;
		enabled = payload.enabled === true;
		const batch = Array.isArray(payload.events)
			? payload.events
					.map(asActivityEvent)
					.filter((event): event is ValheimActivityEvent => event !== null)
			: [];
		const nextCursor = typeof payload.cursor === 'number' ? payload.cursor : valheimCursor;
		if (batch.length === 0 && valheimCursor > 0 && page === 0) {
			const restarted = await activityFeedRestarted(valheimCursor);
			if (restarted) {
				valheimCursor = 0;
				continue;
			}
		}
		events.push(...batch);
		if (batch.length === 0 || nextCursor <= valheimCursor) {
			valheimCursor = Math.max(valheimCursor, nextCursor);
			break;
		}
		valheimCursor = nextCursor;
	}
	return { enabled, valheimCursor, events };
}

async function activityFeedRestarted(storedCursor: number): Promise<boolean> {
	const payload = (await request('/api/activity?cursor=0').then((response) => response.json())) as unknown;
	if (!isRecord(payload) || !Array.isArray(payload.events)) return false;
	const newest = payload.events.reduce((max, event) => {
		const id = isRecord(event) && typeof event.id === 'number' ? event.id : 0;
		return Math.max(max, id);
	}, 0);
	return newest > 0 && newest < storedCursor;
}

export async function getValheimActivity(cursor: number | null) {
	try {
		const [activityResult, liveChats] = await Promise.all([
			collectLiveActivity().catch((error: unknown) => {
				if (error instanceof ValheimOneControlError && error.status === 404) return null;
				throw error;
			}),
			liveChatMessages().catch(() => [] as ValheimChatMessage[])
		]);
		const chats = presentWebsiteChats(
			await mergeAndPersistChatArchive(liveChats).catch(async () =>
				mergeChatHistories(await loadChatArchive(), liveChats)
			)
		);
		const saved = activityResult
			? await persistChronicle(activityResult.events, activityResult.valheimCursor).catch(() =>
					loadChronicleArchive().then((archive) => archive.events)
				)
			: await loadChronicleArchive()
					.then((archive) => archive.events)
					.catch(() => [] as ValheimActivityEvent[]);
		return {
			enabled: activityResult?.enabled === true || saved.length > 0,
			cursor: saved.at(-1)?.id ?? cursor ?? 0,
			events: chronicleSince(saved, cursor),
			chats
		};
	} catch (error) {
		const chats = presentWebsiteChats(await loadChatArchive().catch(() => []));
		const saved = await savedChronicle(cursor).catch(() => ({
			cursor: cursor ?? 0,
			events: [] as ValheimActivityEvent[]
		}));
		if (chats.length === 0 && saved.events.length === 0) throw error;
		return {
			enabled: saved.events.length > 0,
			cursor: saved.cursor,
			events: saved.events,
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
