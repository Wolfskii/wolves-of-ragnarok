import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveImageUpload } from '$lib/server/media';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Authentication required.' }, { status: 401 });

	const formData = await request.formData();
	const file = formData.get('file');
	if (!(file instanceof File)) return json({ error: 'Choose an image.' }, { status: 400 });

	try {
		const media = await saveImageUpload(file, locals.user.id, 'IMAGE');
		return json({ id: media.id, url: `/api/media/${media.id}` });
	} catch (caught) {
		const message = caught instanceof Error ? caught.message : 'IMAGE_UPLOAD_FAILED';
		const status =
			message === 'IMAGE_TOO_LARGE' || message === 'IMAGE_DIMENSIONS_INVALID' ? 413 : 400;
		return json({ error: message }, { status });
	}
};
