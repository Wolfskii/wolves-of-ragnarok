import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readMedia } from '$lib/server/media';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const media = await readMedia(params.id);
		if (!media) error(404, 'Media not found.');
		return new Response(media.data, {
			headers: {
				'cache-control': 'public, max-age=31536000, immutable',
				'content-type': media.mimeType,
				'x-content-type-options': 'nosniff'
			}
		});
	} catch {
		error(404, 'Media not found.');
	}
};
