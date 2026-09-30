import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: new Proxy({} as Record<string, string | undefined>, {
		get: (_target, property) => process.env[String(property)]
	})
}));

import { getValheimLeaderboard } from './valheimone-control';

describe('ValheimOne control reads', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
	});

	it('reads the public leaderboard without an access token', async () => {
		vi.stubEnv('VALHEIMONE_ADMIN_TOKEN', '');
		vi.stubEnv('VALHEIM_PLAYERS_TOKEN', '');
		vi.stubEnv('VALHEIM_MAP_URL', 'https://map.test');
		vi.stubEnv('VALHEIM_MAP_INTERNAL_URL', '');
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					players: [
						{
							name: 'Freydis',
							playSeconds: 120,
							deaths: 2,
							distanceMeters: 3400,
							online: true
						}
					]
				}),
				{ status: 200 }
			)
		);
		vi.stubGlobal('fetch', fetchMock);

		await expect(getValheimLeaderboard()).resolves.toEqual([
			{
				name: 'Freydis',
				playSeconds: 120,
				deaths: 2,
				distanceMeters: 3400,
				online: true
			}
		]);
		expect(fetchMock.mock.calls[0]?.[0]).toBe('https://map.test/api/leaderboard');
		expect(fetchMock.mock.calls[0]?.[1]?.headers?.['x-livemap-token']).toBeUndefined();
	});

	it('retries the leaderboard on the internal map origin', async () => {
		vi.stubEnv('VALHEIMONE_ADMIN_TOKEN', '');
		vi.stubEnv('VALHEIM_PLAYERS_TOKEN', '');
		vi.stubEnv('VALHEIM_MAP_URL', 'https://map.test');
		vi.stubEnv('VALHEIM_MAP_INTERNAL_URL', 'http://valheim:28080');
		const fetchMock = vi
			.fn()
			.mockRejectedValueOnce(new Error('connect ECONNREFUSED'))
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						players: [
							{ name: 'Freydis', playSeconds: 10, deaths: 0, distanceMeters: 12, online: false }
						]
					}),
					{ status: 200 }
				)
			);
		vi.stubGlobal('fetch', fetchMock);

		const players = await getValheimLeaderboard();

		expect(players.map((player) => player.name)).toEqual(['Freydis']);
		expect(fetchMock.mock.calls[1]?.[0]).toBe('http://valheim:28080/api/leaderboard');
	});
});
