export const DEFAULT_CHRONICLE_RETENTION_DAYS = 7;

export type ChronicleEvent = {
	id: number;
	unixMs: number;
	type: string;
	data: Record<string, unknown>;
};

export function chronicleRetentionMs(days: number): number {
	const wholeDays = Number.isFinite(days) ? Math.floor(days) : DEFAULT_CHRONICLE_RETENTION_DAYS;
	const clamped = Math.min(3650, Math.max(1, wholeDays));
	return clamped * 24 * 60 * 60 * 1000;
}

export function chronicleFingerprint(event: ChronicleEvent): string {
	return `${event.unixMs}|${event.type}|${JSON.stringify(event.data)}`;
}

export function mergeChronicle(
	archived: ChronicleEvent[],
	incoming: ChronicleEvent[],
	nowMs: number,
	retentionMs: number
): ChronicleEvent[] {
	const cutoff = nowMs - retentionMs;
	const byKey = new Map<string, ChronicleEvent>();
	let nextId = 0;
	for (const event of archived) {
		if (event.unixMs < cutoff) continue;
		nextId = Math.max(nextId, event.id);
		byKey.set(chronicleFingerprint(event), event);
	}
	for (const event of incoming) {
		if (event.unixMs < cutoff) continue;
		const key = chronicleFingerprint(event);
		if (byKey.has(key)) continue;
		nextId += 1;
		byKey.set(key, { ...event, id: nextId });
	}
	return [...byKey.values()].sort(
		(left, right) => left.unixMs - right.unixMs || left.id - right.id
	);
}

export function chronicleSince(events: ChronicleEvent[], cursor: number | null): ChronicleEvent[] {
	if (cursor === null) return events;
	return events.filter((event) => event.id > cursor);
}
