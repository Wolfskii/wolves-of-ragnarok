import { describe, expect, it } from 'vitest';
import { MockServerAdapter } from './mock';
import { assertSafeQueryTarget } from './target';

const target = {
	id: 'test-server',
	name: "The Wolves' Den",
	host: 'example.com',
	gamePort: 2456,
	queryPort: 2457,
	timeoutMs: 3000
};

describe('server status adapters', () => {
	it('returns deterministic development data', async () => {
		const adapter = new MockServerAdapter();
		const first = await adapter.query(target);
		const second = await adapter.query(target);

		expect(first).toMatchObject({
			serverId: 'test-server',
			state: 'online',
			playerCount: 4,
			maxPlayers: 10,
			playerNames: ['Eirik', 'Freydis', 'Ulf', 'Sigrun']
		});
		expect(second).toMatchObject({
			playerCount: first.playerCount,
			playerNames: first.playerNames
		});
	});

	it('blocks loopback targets unless explicitly permitted', async () => {
		await expect(assertSafeQueryTarget('127.0.0.1', false)).rejects.toThrow('UNSAFE_TARGET');
		await expect(assertSafeQueryTarget('127.0.0.1', true)).resolves.toBe('127.0.0.1');
	});
});
