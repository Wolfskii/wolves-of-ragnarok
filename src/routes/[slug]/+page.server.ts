import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';
import { sanitizeRichText } from '$lib/server/rich-text';

const authorSelect = {
	username: true,
	steamUsername: true,
	steamProfileUrl: true,
	steamAvatarUrl: true,
	avatarMedia: { select: { id: true } },
	discordUsername: true,
	role: true,
	bio: true,
	createdAt: true
} as const;

export const load: PageServerLoad = async ({ params }) => {
	try {
		if (params.slug === 'news') {
			return {
				newsPosts: await getDatabase().newsPost.findMany({
					where: { status: 'PUBLISHED' },
					orderBy: { publishedAt: 'desc' },
					select: {
						title: true,
						excerpt: true,
						body: true,
						publishedAt: true,
						author: { select: { username: true } }
					}
				})
			};
		}

		if (params.slug === 'members') {
			const members = await getDatabase().user.findMany({
				where: { isActive: true },
				orderBy: { createdAt: 'asc' },
				select: authorSelect
			});
			return {
				members: members.map((member) => ({
					...member,
					bio: sanitizeRichText(member.bio ?? '')
				}))
			};
		}

		if (params.slug === 'about') {
			const page = await getDatabase().page.findUnique({
				where: { slug: 'about' },
				select: { body: true }
			});
			return { aboutBody: page?.body ?? null };
		}
	} catch {
		return {};
	}

	return {};
};
