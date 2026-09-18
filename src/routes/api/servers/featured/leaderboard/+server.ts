import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getValheimLeaderboard,
	ValheimOneControlError
} from '$lib/server/server-status/valheimone-control';

export const GET: RequestHandler = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'private, no-store',
		vary: 'Cookie'
	});

	try {
		return json({ players: await getValheimLeaderboard() });
	} catch (error) {
		const status = error instanceof ValheimOneControlError && error.status === 429 ? 429 : 503;
		return json({ error: 'The leaderboard is temporarily unavailable.' }, { status });
	}
};
