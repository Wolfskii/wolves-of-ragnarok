import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getPrivateEnv } from '../env';
import {
	chronicleRetentionMs,
	mergeChronicle,
	type ChronicleEvent
} from './chronicle';

const ARCHIVE_FILE = 'server-events.json';
const ARCHIVE_MAXIMUM_BYTES = 8 * 1024 * 1024;

type ChronicleArchive = {
	valheimCursor: number;
	events: ChronicleEvent[];
};

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

function asEvent(value: unknown): ChronicleEvent | null {
	if (!isRecord(value)) return null;
	if (typeof value.id !== 'number' || typeof value.unixMs !== 'number') return null;
	if (typeof value.type !== 'string' || !value.type.trim()) return null;
	if (!Number.isFinite(value.id) || !Number.isFinite(value.unixMs) || value.unixMs <= 0) return null;
	return {
		id: value.id,
		unixMs: value.unixMs,
		type: value.type,
		data: isRecord(value.data) ? value.data : {}
	};
}

async function readArchiveUnlocked(): Promise<ChronicleArchive> {
	try {
		const file = await readFile(archivePath());
		if (file.byteLength === 0 || file.byteLength > ARCHIVE_MAXIMUM_BYTES) {
			return { valheimCursor: 0, events: [] };
		}
		const payload = JSON.parse(file.toString('utf8')) as unknown;
		if (!isRecord(payload)) return { valheimCursor: 0, events: [] };
		const valheimCursor =
			typeof payload.valheimCursor === 'number' && payload.valheimCursor >= 0
				? payload.valheimCursor
				: 0;
		const events = Array.isArray(payload.events)
			? payload.events
					.map(asEvent)
					.filter((event): event is ChronicleEvent => event !== null)
			: [];
		return { valheimCursor, events };
	} catch {
		return { valheimCursor: 0, events: [] };
	}
}

async function writeArchiveUnlocked(archive: ChronicleArchive): Promise<void> {
	const path = archivePath();
	const temporaryPath = `${path}.tmp`;
	await mkdir(dirname(path), { recursive: true });
	const body = `${JSON.stringify(archive)}\n`;
	await writeFile(temporaryPath, body, 'utf8');
	try {
		await rename(temporaryPath, path);
	} catch {
		await writeFile(path, body, 'utf8');
		await unlink(temporaryPath).catch(() => undefined);
	}
}

export function loadChronicleArchive(): Promise<ChronicleArchive> {
	return withArchiveLock(readArchiveUnlocked);
}

export function persistChronicle(
	incoming: ChronicleEvent[],
	valheimCursor: number
): Promise<ChronicleEvent[]> {
	return withArchiveLock(async () => {
		const current = await readArchiveUnlocked();
		const events = mergeChronicle(
			current.events,
			incoming,
			Date.now(),
			chronicleRetentionMs(getPrivateEnv().CHRONICLE_RETENTION_DAYS)
		);
		await writeArchiveUnlocked({
			valheimCursor: Math.max(current.valheimCursor, valheimCursor),
			events
		});
		return events;
	});
}
