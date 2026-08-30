import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { getDatabase } from '$lib/server/db';
import { hasRichTextContent, sanitizeRichText } from '$lib/server/rich-text';

const replySchema = z.object({
	body: z.string().trim().min(1, 'Write something before posting.').max(10_000)
});

const authorSelect = {
	username: true,
	steamUsername: true,
	steamProfileUrl: true,
	steamAvatarUrl: true,
	avatarMedia: { select: { id: true } },
	discordUsername: true,
	discordUserId: true
} as const;

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) return { thread: null, requiresLogin: true };

	try {
		const thread = await getDatabase().forumThread.findUnique({
			where: { slug: params.slug },
			include: {
				author: { select: authorSelect },
				posts: {
					orderBy: { createdAt: 'asc' },
					include: { author: { select: authorSelect } }
				}
			}
		});
		if (!thread) error(404, 'This thread has been lost beyond the Bifröst.');
		return { thread };
	} catch (caught) {
		if (caught instanceof Error && caught.message.includes('lost beyond')) throw caught;
		return { thread: null, requiresLogin: true };
	}
};

export const actions = {
	reply: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { replyError: 'Sign in to reply.' });
		const formData = await request.formData();
		const parsed = replySchema.safeParse({ body: formData.get('body') });
		if (!parsed.success) {
			return fail(400, {
				replyError: parsed.error.issues[0]?.message ?? 'Check your reply.',
				body: String(formData.get('body') ?? '')
			});
		}
		const body = sanitizeRichText(parsed.data.body);
		if (!hasRichTextContent(body))
			return fail(400, { replyError: 'Write something before posting.' });

		const database = getDatabase();
		const thread = await database.forumThread.findUnique({
			where: { slug: params.slug },
			select: { id: true }
		});
		if (!thread) error(404, 'This thread has been lost beyond the Bifröst.');
		await database.forumPost.create({
			data: { body, authorId: locals.user.id, threadId: thread.id }
		});
		await database.forumThread.update({
			where: { id: thread.id },
			data: { updatedAt: new Date() }
		});
		redirect(303, `/community/${params.slug}`);
	}
} satisfies Actions;
