import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ locals, setHeaders }) => {
	setHeaders({
		'cache-control': 'private, no-store',
		vary: 'Cookie'
	});

	if (!locals.user) {
		return json({ error: 'Authentication required.' }, { status: 401 });
	}

	const password = env.VALHEIM_SERVER_PASSWORD?.trim();
	if (!password) {
		return json({ error: 'The server password is not configured.' }, { status: 503 });
	}

	return json({ password });
};
