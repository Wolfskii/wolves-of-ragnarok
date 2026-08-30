import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';
import { hasRichTextContent, sanitizeRichText } from '$lib/server/rich-text';

const threadSchema = z.object({
	title: z.string().trim().min(4, 'Thread title must contain at least 4 characters.').max(160),
	body: z.string().trim().min(1, 'Write something before opening the thread.').max(10_000)
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

export const load: PageServerLoad = async () => {
	try {
		return {
			threads: await getDatabase().forumThread.findMany({
				orderBy: { updatedAt: 'desc' },
				include: {
					author: { select: authorSelect },
					_count: { select: { posts: true } },
					posts: {
						orderBy: { createdAt: 'desc' },
						take: 1,
						select: { createdAt: true }
					}
				}
			})
		};
	} catch {
		return { threads: [] };
	}
};

export const actions = {
	createThread: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { forumError: 'Sign in to start a thread.' });

		const formData = await request.formData();
		const parsed = threadSchema.safeParse({
			title: formData.get('title'),
			body: formData.get('body')
		});
		if (!parsed.success) {
			return fail(400, {
				forumError: parsed.error.issues[0]?.message ?? 'Check your thread details.',
				values: {
					title: String(formData.get('title') ?? ''),
					body: String(formData.get('body') ?? '')
				}
			});
		}
		const body = sanitizeRichText(parsed.data.body);
		if (!hasRichTextContent(body)) {
			return fail(400, { forumError: 'Write something before opening the thread.' });
		}

		const slug = `${parsed.data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')}-${randomUUID().slice(0, 8)}`;
		const thread = await getDatabase().forumThread.create({
			data: {
				slug,
				title: parsed.data.title,
				authorId: locals.user.id,
				posts: { create: { body, authorId: locals.user.id } }
			}
		});

		redirect(303, `/community/${thread.slug}`);
	}
} satisfies Actions;
