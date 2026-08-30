import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { getDatabase } from '$lib/server/db';
import { createSession } from '$lib/server/auth/session';
import { hashPassword, verifyPassword } from '$lib/server/auth/crypto';
import {
	optionalDiscordUserId,
	optionalDiscordUsername,
	optionalSteamProfileUrl
} from '$lib/server/auth/schemas';
import { fetchSteamProfile } from '$lib/server/steam';
import { saveImageUpload } from '$lib/server/media';
import { sanitizeRichText } from '$lib/server/rich-text';

const profileSchema = z.object({
	steamProfileUrl: optionalSteamProfileUrl,
	discordUsername: optionalDiscordUsername,
	discordUserId: optionalDiscordUserId,
	bio: z.string().trim().max(10_000)
});

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1),
		newPassword: z.string().min(12).max(128),
		confirmPassword: z.string()
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: 'New passwords do not match.',
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ locals }) => {
	const profile = await getDatabase().user.findUniqueOrThrow({
		where: { id: locals.user!.id },
		select: {
			username: true,
			email: true,
			steamProfileUrl: true,
			steamUsername: true,
			steamAvatarUrl: true,
			avatarMediaId: true,
			discordUsername: true,
			discordUserId: true,
			bio: true,
			role: true,
			createdAt: true
		}
	});
	return { profile: { ...profile, bio: sanitizeRichText(profile.bio ?? '') } };
};

export const actions = {
	profile: async ({ request, locals }) => {
		const formData = await request.formData();
		const parsed = profileSchema.safeParse({
			steamProfileUrl: formData.get('steamProfileUrl'),
			discordUsername: formData.get('discordUsername'),
			discordUserId: formData.get('discordUserId'),
			bio: formData.get('bio')
		});
		if (!parsed.success) return fail(400, { profileError: parsed.error.issues[0]?.message });
		let avatarMediaId: string | undefined;
		const avatarFile = formData.get('avatar');
		if (avatarFile instanceof File && avatarFile.size > 0) {
			try {
				avatarMediaId = (await saveImageUpload(avatarFile, locals.user!.id, 'AVATAR')).id;
			} catch (caught) {
				const code = caught instanceof Error ? caught.message : 'IMAGE_UPLOAD_FAILED';
				const message =
					code === 'UNSUPPORTED_IMAGE_TYPE'
						? 'Use a JPG, PNG, WebP, or GIF image.'
						: code === 'IMAGE_TOO_LARGE'
							? 'That image is too large.'
							: 'The profile image could not be uploaded.';
				return fail(400, { profileError: message });
			}
		}
		const useSteamAvatar = formData.get('useSteamAvatar') === 'on';
		const steamProfile = parsed.data.steamProfileUrl
			? await fetchSteamProfile(parsed.data.steamProfileUrl)
			: { username: null, avatarUrl: null };

		await getDatabase().user.update({
			where: { id: locals.user!.id },
			data: {
				...(avatarMediaId ? { avatarMediaId } : useSteamAvatar ? { avatarMediaId: null } : {}),
				steamProfileUrl: parsed.data.steamProfileUrl ?? null,
				steamUsername: steamProfile.username,
				steamAvatarUrl: steamProfile.avatarUrl,
				discordUsername: parsed.data.discordUsername ?? null,
				discordUserId: parsed.data.discordUserId ?? null,
				bio: sanitizeRichText(parsed.data.bio) || null,
				lastSeenAt: new Date(),
				activities: { create: { type: 'PROFILE_UPDATED', summary: 'Updated their guild profile.' } }
			}
		});

		return { profileSuccess: true };
	},
	password: async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
		if (!parsed.success)
			return fail(400, {
				passwordError: parsed.error.issues[0]?.message ?? 'Check your password.'
			});

		const user = await getDatabase().user.findUniqueOrThrow({ where: { id: locals.user!.id } });
		if (!(await verifyPassword(user.passwordHash, parsed.data.currentPassword))) {
			return fail(400, { passwordError: 'Current password is incorrect.' });
		}

		await getDatabase().$transaction([
			getDatabase().user.update({
				where: { id: user.id },
				data: { passwordHash: await hashPassword(parsed.data.newPassword) }
			}),
			getDatabase().session.deleteMany({ where: { userId: user.id } })
		]);
		await createSession(user.id, cookies);
		return { passwordSuccess: true };
	}
} satisfies Actions;
