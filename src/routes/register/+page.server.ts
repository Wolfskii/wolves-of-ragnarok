import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hashPassword } from '$lib/server/auth/crypto';
import { registrationSchema } from '$lib/server/auth/schemas';
import { createSession } from '$lib/server/auth/session';
import { getDatabase } from '$lib/server/db';
import { fetchSteamProfile } from '$lib/server/steam';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/profile');
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const values = {
			email: String(formData.get('email') ?? ''),
			username: String(formData.get('username') ?? ''),
			steamProfileUrl: String(formData.get('steamProfileUrl') ?? ''),
			password: String(formData.get('password') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? '')
		};
		const parsed = registrationSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				registrationError: parsed.error.issues[0]?.message ?? 'Check your details.',
				values: {
					email: values.email,
					username: values.username,
					steamProfileUrl: values.steamProfileUrl
				}
			});
		}

		const existing = await getDatabase().user.findFirst({
			where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] },
			select: { email: true, username: true }
		});

		if (existing) {
			return fail(409, {
				registrationError:
					existing.email === parsed.data.email
						? 'An account already uses that email.'
						: 'That username is already claimed.',
				values: {
					email: parsed.data.email,
					username: parsed.data.username,
					steamProfileUrl: parsed.data.steamProfileUrl ?? ''
				}
			});
		}

		const steamProfile = parsed.data.steamProfileUrl
			? await fetchSteamProfile(parsed.data.steamProfileUrl)
			: { username: null, avatarUrl: null };

		const user = await getDatabase().user.create({
			data: {
				email: parsed.data.email,
				username: parsed.data.username,
				steamProfileUrl: parsed.data.steamProfileUrl ?? null,
				steamUsername: steamProfile.username,
				steamAvatarUrl: steamProfile.avatarUrl,
				passwordHash: await hashPassword(parsed.data.password),
				lastSeenAt: new Date(),
				activities: { create: { type: 'JOINED', summary: 'Joined the Wolves of Ragnarok.' } }
			}
		});

		await createSession(user.id, cookies);
		redirect(303, '/profile');
	}
} satisfies Actions;
