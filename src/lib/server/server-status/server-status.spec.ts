import { afterEach, describe, expect, it, vi } from 'vitest';
import { MockServerAdapter } from './mock';
import { assertSafeQueryTarget } from './target';
import { ValheimOneAdapter } from './valheimone';

const target = {
	id: 'test-server',
	name: "The Wolves' Den",
	host: 'example.com',
	gamePort: 2456,
	queryPort: 2457,
	timeoutMs: 3000
};

describe('server status adapters', () => {
	afterEach(() => vi.unstubAllGlobals());

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

	it('normalizes ValheimOne health and token-authenticated players', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						serverName: 'Yggdrasil',
						worldName: 'Yggdrasil',
						pluginVersion: '0.13.2',
						players: 2,
						maxPlayers: 10,
						day: 42,
						snapshotAgeMs: 1200,
						map: { renderRevision: '5-12345' }
					}),
					{ status: 200 }
				)
			)
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ players: [{ name: 'Freydis' }, { name: '' }] }), {
					status: 200
				})
			);
		vi.stubGlobal('fetch', fetchMock);

		const adapter = new ValheimOneAdapter({
			statusUrl: 'https://map.test/api/status',
			playersUrl: 'https://map.test/api/players',
			playersToken: 'secret-token',
			mapUrl: 'https://map.test',
			joinAddress: 'valheim.test',
			joinPort: 2456
		});
		const result = await adapter.query({ ...target, timeoutMs: 1000 });

		expect(result).toMatchObject({
			name: 'Yggdrasil',
			state: 'online',
			playerCount: 2,
			maxPlayers: 10,
			playerNames: ['Freydis'],
			worldName: 'Yggdrasil',
			day: 42,
			joinAddress: 'valheim.test',
			joinPort: 2456,
			mapImageUrl: 'https://map.test/base.png?v=5-12345',
			mapTileUrl: 'https://map.test/tiles/{z}/{x}-{y}.png?v=5-12345',
			mapMaxZoom: null
		});
		expect(fetchMock.mock.calls[1]?.[0]).toBe('https://map.test/api/players?token=secret-token');
	});
});
