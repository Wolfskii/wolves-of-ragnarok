export type ServerQueryTarget = {
	id: string;
	name: string;
	host: string;
	gamePort: number;
	queryPort: number | null;
	timeoutMs: number;
};

export type ServerStatusResult = {
	serverId: string;
	name: string;
	joinAddress: string;
	joinPort: number;
	mapUrl: string;
	mapImageUrl: string | null;
	state: 'online' | 'offline' | 'error';
	playerCount: number | null;
	maxPlayers: number | null;
	playerNames: string[];
	pingMs: number | null;
	worldName: string | null;
	version: string | null;
	day: number | null;
	snapshotAgeMs: number | null;
	queriedAt: string;
	errorCode?: 'UNREACHABLE' | 'UNSAFE_TARGET' | 'QUERY_FAILED';
};

export interface GameServerAdapter {
	query(target: ServerQueryTarget): Promise<ServerStatusResult>;
}
