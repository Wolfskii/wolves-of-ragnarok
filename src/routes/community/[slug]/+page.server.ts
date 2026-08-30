import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { getDatabase } from '$lib/server/db';

const replySchema = z.object({
	body: z.string().trim().min(1, 'Write something before posting.').max(10_000)
});

const authorSelect = {
	username: true,
	steamUsername: true,
	steamProfileUrl: true,
	steamAvatarUrl: true,
	discordUsername: true,
	discordUserId: true
} as const;

export const load: PageServerLoad = async ({ params }) => {
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

		const database = getDatabase();
		const thread = await database.forumThread.findUnique({
			where: { slug: params.slug },
			select: { id: true }
		});
		if (!thread) error(404, 'This thread has been lost beyond the Bifröst.');
		await database.forumPost.create({
			data: { body: parsed.data.body, authorId: locals.user.id, threadId: thread.id }
		});
		await database.forumThread.update({
			where: { id: thread.id },
			data: { updatedAt: new Date() }
		});
		redirect(303, `/community/${params.slug}`);
	}
} satisfies Actions;
