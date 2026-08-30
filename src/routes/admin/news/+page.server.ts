import { error, fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { canPublishNews } from '$lib/server/auth/authorization';
import { getDatabase } from '$lib/server/db';
import { hasRichTextContent, sanitizeRichText } from '$lib/server/rich-text';

const newsSchema = z.object({
	title: z.string().trim().min(4, 'Title must contain at least 4 characters.').max(180),
	excerpt: z.string().trim().min(1, 'Add a short summary.').max(320),
	body: z.string().trim().min(1, 'Write the news story before publishing.').max(30_000)
});

export const load: PageServerLoad = async ({ locals }) => {
	if (!canPublishNews(locals.user)) error(403, 'News publishing is restricted to the war council.');
	return {
		posts: await getDatabase().newsPost.findMany({
			orderBy: { createdAt: 'desc' },
			select: { id: true, title: true, excerpt: true, status: true, createdAt: true }
		})
	};
};

export const actions = {
	publish: async ({ request, locals }) => {
		if (!canPublishNews(locals.user)) return fail(403, { newsError: 'You cannot publish news.' });
		const formData = await request.formData();
		const parsed = newsSchema.safeParse({
			title: formData.get('title'),
			excerpt: formData.get('excerpt'),
			body: formData.get('body')
		});
		if (!parsed.success) return fail(400, { newsError: parsed.error.issues[0]?.message });

		const body = sanitizeRichText(parsed.data.body);
		if (!hasRichTextContent(body))
			return fail(400, { newsError: 'Write the news story before publishing.' });
		const slug = `${parsed.data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')}-${randomUUID().slice(0, 8)}`;
		await getDatabase().newsPost.create({
			data: {
				slug,
				title: parsed.data.title,
				excerpt: parsed.data.excerpt,
				body,
				status: 'PUBLISHED',
				publishedAt: new Date(),
				authorId: locals.user!.id
			}
		});
		redirect(303, '/admin/news');
	}
} satisfies Actions;
