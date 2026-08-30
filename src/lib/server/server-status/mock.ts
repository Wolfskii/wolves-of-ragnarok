import type { GameServerAdapter, ServerQueryTarget, ServerStatusResult } from './types';

export class MockServerAdapter implements GameServerAdapter {
	async query(target: ServerQueryTarget): Promise<ServerStatusResult> {
		return {
			serverId: target.id,
			name: target.name,
			joinAddress: target.host,
			joinPort: target.gamePort,
			mapUrl: 'https://valheim-map.webble.se',
			mapImageUrl: 'https://valheim-map.webble.se/base.png?v=mock',
			state: 'online',
			playerCount: 4,
			maxPlayers: 10,
			playerNames: ['Eirik', 'Freydis', 'Ulf', 'Sigrun'],
			pingMs: 42,
			worldName: target.name,
			version: 'mock',
			day: 1,
			snapshotAgeMs: 0,
			queriedAt: new Date().toISOString()
		};
	}
}
