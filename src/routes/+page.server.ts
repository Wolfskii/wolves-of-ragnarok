import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { loginSchema } from '$lib/server/auth/schemas';
import { verifyPassword } from '$lib/server/auth/crypto';
import { createSession } from '$lib/server/auth/session';
import { getDatabase } from '$lib/server/db';

export const actions = {
	login: async ({ request, cookies, locals }) => {
		if (locals.user) redirect(303, '/profile');

		const formData = await request.formData();
		const parsed = loginSchema.safeParse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		if (!parsed.success) {
			return fail(400, {
				loginError: parsed.error.issues[0]?.message ?? 'Check your credentials.',
				email: String(formData.get('email') ?? '')
			});
		}

		const user = await getDatabase().user.findUnique({ where: { email: parsed.data.email } });
		if (
			!user ||
			!user.isActive ||
			!(await verifyPassword(user.passwordHash, parsed.data.password))
		) {
			return fail(400, {
				loginError: 'The email or password does not match our records.',
				email: parsed.data.email
			});
		}

		await createSession(user.id, cookies);
		await getDatabase().user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
		redirect(303, '/');
	}
} satisfies Actions;
