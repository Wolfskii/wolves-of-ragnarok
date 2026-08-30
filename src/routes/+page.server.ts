import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from '$lib/server/auth/schemas';
import { verifyPassword } from '$lib/server/auth/crypto';
import { createSession } from '$lib/server/auth/session';
import { getDatabase } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	try {
		return {
			news: await getDatabase().newsPost.findMany({
				where: { status: 'PUBLISHED' },
				orderBy: { publishedAt: 'desc' },
				take: 3,
				select: {
					title: true,
					excerpt: true,
					publishedAt: true,
					author: { select: { username: true } }
				}
			})
		};
	} catch {
		return { news: [] };
	}
};

export const actions = {
	login: async ({ request, cookies, locals }) => {
		if (locals.user) redirect(303, '/profile');

		const formData = await request.formData();
		const parsed = loginSchema.safeParse({
			identifier: formData.get('identifier') ?? formData.get('email'),
			password: formData.get('password')
		});

		if (!parsed.success) {
			return fail(400, {
				loginError: parsed.error.issues[0]?.message ?? 'Check your credentials.',
				identifier: String(formData.get('identifier') ?? formData.get('email') ?? '')
			});
		}

		const user = await getDatabase().user.findFirst({
			where: {
				OR: [{ email: parsed.data.identifier }, { username: parsed.data.identifier }]
			}
		});
		if (
			!user ||
			!user.isActive ||
			!(await verifyPassword(user.passwordHash, parsed.data.password))
		) {
			return fail(400, {
				loginError: 'The email, username, or password does not match our records.',
				identifier: parsed.data.identifier
			});
		}

		await createSession(user.id, cookies);
		await getDatabase().user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
		redirect(303, '/');
	}
} satisfies Actions;
