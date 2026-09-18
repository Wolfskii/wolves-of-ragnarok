import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getPrivateEnv } from '../env';
import type { ValheimChatMessage } from './valheimone-control';
import {
	CHAT_ARCHIVE_CAPACITY,
	asArchivedChat,
	mergeChatHistories
} from './chat-history';

const ARCHIVE_FILE = 'server-chat.json';
const ARCHIVE_MAXIMUM_BYTES = 512 * 1024;

let archiveChain = Promise.resolve();

function withArchiveLock<T>(work: () => Promise<T>): Promise<T> {
	const next = archiveChain.then(work, work);
	archiveChain = next.then(
		() => undefined,
		() => undefined
	);
	return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function archivePath(): string {
	return resolve(getPrivateEnv().UPLOAD_DIR, ARCHIVE_FILE);
}

async function readArchiveUnlocked(): Promise<ValheimChatMessage[]> {
	try {
		const path = archivePath();
		const file = await readFile(path);
		if (file.byteLength === 0 || file.byteLength > ARCHIVE_MAXIMUM_BYTES) return [];
		const payload = JSON.parse(file.toString('utf8')) as unknown;
		const chats = isRecord(payload) && Array.isArray(payload.chats) ? payload.chats : [];
		return chats
			.map(asArchivedChat)
			.filter((chat): chat is ValheimChatMessage => chat !== null)
			.slice(-CHAT_ARCHIVE_CAPACITY);
	} catch {
		return [];
	}
}

async function writeArchiveUnlocked(chats: ValheimChatMessage[]): Promise<void> {
	const path = archivePath();
	const temporaryPath = `${path}.tmp`;
	await mkdir(dirname(path), { recursive: true });
	const body = `${JSON.stringify({ chats })}\n`;
	await writeFile(temporaryPath, body, 'utf8');
	try {
		await rename(temporaryPath, path);
	} catch {
		await writeFile(path, body, 'utf8');
		await unlink(temporaryPath).catch(() => undefined);
	}
}

export function loadChatArchive(): Promise<ValheimChatMessage[]> {
	return withArchiveLock(readArchiveUnlocked);
}

export function mergeAndPersistChatArchive(
	live: ValheimChatMessage[]
): Promise<ValheimChatMessage[]> {
	return withArchiveLock(async () => {
		const merged = mergeChatHistories(await readArchiveUnlocked(), live);
		await writeArchiveUnlocked(merged);
		return merged;
	});
}
