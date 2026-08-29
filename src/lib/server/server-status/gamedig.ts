import { GameDig } from 'gamedig';
import type { GameServerAdapter, ServerQueryTarget, ServerStatusResult } from './types';
import { assertSafeQueryTarget } from './target';

export class ValheimGameDigAdapter implements GameServerAdapter {
	constructor(private readonly allowPrivateHosts = false) {}

	async query(target: ServerQueryTarget): Promise<ServerStatusResult> {
		try {
			const address = await assertSafeQueryTarget(target.host, this.allowPrivateHosts);
			const state = await GameDig.query({
				type: 'valheim',
				host: target.host,
				address,
				port: target.queryPort ?? target.gamePort + 1,
				givenPortOnly: true,
				maxRetries: 0,
				socketTimeout: Math.min(target.timeoutMs, 3000),
				attemptTimeout: target.timeoutMs,
				requestPlayersRequired: false
			});

			return {
				serverId: target.id,
				name: target.name,
				state: 'online',
				playerCount: state.numplayers,
				maxPlayers: state.maxplayers,
				playerNames: state.players
					.map((player) => player.name?.trim())
					.filter((name): name is string => Boolean(name)),
				pingMs: state.ping,
				worldName: state.map || null,
				version: state.version || null,
				queriedAt: new Date().toISOString()
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : 'QUERY_FAILED';
			const errorCode =
				message === 'UNSAFE_TARGET'
					? 'UNSAFE_TARGET'
					: message === 'UNREACHABLE'
						? 'UNREACHABLE'
						: 'QUERY_FAILED';
			return {
				serverId: target.id,
				name: target.name,
				state: 'error',
				playerCount: null,
				maxPlayers: null,
				playerNames: [],
				pingMs: null,
				worldName: null,
				version: null,
				queriedAt: new Date().toISOString(),
				errorCode
			};
		}
	}
}
