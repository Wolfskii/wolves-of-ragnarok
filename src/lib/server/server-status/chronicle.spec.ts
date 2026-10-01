import { describe, expect, it } from 'vitest';
import { chronicleRetentionMs, chronicleSince, mergeChronicle } from './chronicle';

const day = 24 * 60 * 60 * 1000;

describe('chronicle retention', () => {
	it('keeps seven days by default', () => {
		expect(chronicleRetentionMs(7)).toBe(7 * day);
	});

	it('drops events older than the window and ignores a repeated live copy', () => {
		const now = 1_700_000_000_000;
		const kept = {
			id: 1,
			unixMs: now - 2 * day,
			type: 'player.join',
			data: { name: 'Freydis' }
		};
		const expired = { ...kept, id: 2, unixMs: now - 8 * day };
		const echo = { ...kept, id: 99 };
		const fresh = {
			id: 3,
			unixMs: now,
			type: 'player.death',
			data: { name: 'Freydis' }
		};

		expect(mergeChronicle([kept, expired], [echo, fresh], now, 7 * day)).toEqual([
			kept,
			{ ...fresh, id: 2 }
		]);
	});

	it('returns the saved window on the first read and only newer lines after that', () => {
		const events = [
			{ id: 4, unixMs: 10, type: 'day.change', data: { day: 1 } },
			{ id: 9, unixMs: 20, type: 'day.change', data: { day: 2 } }
		];
		expect(chronicleSince(events, null)).toEqual(events);
		expect(chronicleSince(events, 4)).toEqual([events[1]]);
	});
});