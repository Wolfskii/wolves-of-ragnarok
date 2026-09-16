import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getValheimActivity,
	ValheimOneControlError
} from '$lib/server/server-status/valheimone-control';

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	setHeaders({
		'cache-control': 'private, no-store',
		vary: 'Cookie'
	});

	const rawCursor = url.searchParams.get('cursor');
	const cursor = rawCursor === null ? null : Number(rawCursor);
	if (cursor !== null && (!Number.isSafeInteger(cursor) || cursor < 0)) {
		return json({ error: 'Invalid activity cursor.' }, { status: 400 });
	}

	try {
		return json(await getValheimActivity(cursor));
	} catch (error) {
		const status = error instanceof ValheimOneControlError && error.status === 429 ? 429 : 503;
		return json({ error: 'Server activity is temporarily unavailable.' }, { status });
	}
};
