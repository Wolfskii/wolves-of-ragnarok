import type { ValheimChatMessage } from './valheimone-control';

export const CHAT_ARCHIVE_CAPACITY = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

export function chatFingerprint(chat: ValheimChatMessage): string {
	return `${chat.unixMs}|${chat.playerName}|${chat.text}|${chat.shout ? 1 : 0}`;
}

export function asArchivedChat(value: unknown): ValheimChatMessage | null {
	if (!isRecord(value)) return null;
	if (typeof value.sequence !== 'number' || typeof value.unixMs !== 'number') return null;
	if (typeof value.playerName !== 'string' || typeof value.text !== 'string') return null;
	if (!Number.isFinite(value.sequence) || !Number.isFinite(value.unixMs)) return null;
	if (value.unixMs <= 0 || !value.text.trim()) return null;
	return {
		sequence: value.sequence,
		playerName: value.playerName,
		text: value.text,
		shout: value.shout === true,
		unixMs: value.unixMs
	};
}

export function mergeChatHistories(
	archived: ValheimChatMessage[],
	live: ValheimChatMessage[]
): ValheimChatMessage[] {
	const byKey = new Map<string, ValheimChatMessage>();
	for (const chat of archived) byKey.set(chatFingerprint(chat), chat);
	for (const chat of live) byKey.set(chatFingerprint(chat), chat);
	return dedupeHallEchoes(
		[...byKey.values()].sort(
			(left, right) => left.unixMs - right.unixMs || left.sequence - right.sequence
		)
	).slice(-CHAT_ARCHIVE_CAPACITY);
}

const HALL_ECHO_WINDOW_MS = 15_000;

function hallBody(chat: ValheimChatMessage): { name: string; text: string } | null {
	if (!chat.shout) return null;
	if ((chat.playerName.trim() || 'Server') !== 'Server') return null;
	const match = chat.text.match(/^\[([^\]]{1,32})\]\s+([\s\S]+)$/);
	if (!match) return null;
	return { name: match[1], text: match[2] };
}

/** The site used to archive a hall line and ValheimOne recorded the same shout. */
function dedupeHallEchoes(chats: ValheimChatMessage[]): ValheimChatMessage[] {
	const kept: ValheimChatMessage[] = [];
	for (const chat of chats) {
		const body = hallBody(chat);
		const echo =
			body !== null &&
			kept.some((existing) => {
				const previous = hallBody(existing);
				return (
					previous !== null &&
					previous.name === body.name &&
					previous.text === body.text &&
					Math.abs(existing.unixMs - chat.unixMs) <= HALL_ECHO_WINDOW_MS
				);
			});
		if (!echo) kept.push(chat);
	}
	return kept;
}

export function presentWebsiteChat(chat: ValheimChatMessage): ValheimChatMessage {
	if (!chat.shout) return chat;
	const speaker = chat.playerName.trim() || 'Server';
	if (speaker !== 'Server') return chat;
	const match = chat.text.match(/^\[([^\]]{1,32})\]\s+([\s\S]+)$/);
	if (!match) return chat;
	return {
		...chat,
		playerName: match[1],
		text: match[2],
		shout: false
	};
}

export function presentWebsiteChats(chats: ValheimChatMessage[]): ValheimChatMessage[] {
	return chats.map(presentWebsiteChat);
}
