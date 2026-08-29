import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFeaturedServerStatus } from '$lib/server/server-status/service';

export const GET: RequestHandler = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=10, stale-while-revalidate=20' });
	return json(await getFeaturedServerStatus());
};
