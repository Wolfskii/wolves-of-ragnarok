import type { GameServerAdapter, ServerQueryTarget, ServerStatusResult } from './types';

export class MockServerAdapter implements GameServerAdapter {
	async query(target: ServerQueryTarget): Promise<ServerStatusResult> {
		return {
			serverId: target.id,
			name: target.name,
			state: 'online',
			playerCount: 4,
			maxPlayers: 10,
			playerNames: ['Eirik', 'Freydis', 'Ulf', 'Sigrun'],
			pingMs: 42,
			worldName: "The Wolves' Den",
			version: 'mock',
			queriedAt: new Date().toISOString()
		};
	}
}
