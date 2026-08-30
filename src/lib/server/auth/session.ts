import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/db';
import { getPrivateEnv } from '$lib/server/env';
import { createSessionToken, hashSessionToken } from './crypto';

export const SESSION_COOKIE = 'wor_session';

export type SessionUser = {
	id: string;
	email: string;
	username: string;
	steamUsername: string | null;
	steamAvatarUrl: string | null;
	avatarUrl: string | null;
	discordUsername: string | null;
	role: 'USER' | 'MODERATOR' | 'PUBLISHER' | 'ADMIN';
	avatarMediaId: string | null;
};

const cookiePath = '/';

function cookieOptions(expires: Date) {
	return {
		path: cookiePath,
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: !dev,
		expires
	};
}

export async function createSession(userId: string, cookies: Cookies): Promise<void> {
	const config = getPrivateEnv();
	const token = createSessionToken();
	const expiresAt = new Date(Date.now() + config.SESSION_DAYS * 24 * 60 * 60 * 1000);

	await getDatabase().session.create({
		data: {
			tokenHash: hashSessionToken(token, config.AUTH_SECRET),
			userId,
			expiresAt
		}
	});

	cookies.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function validateSession(token: string | undefined): Promise<SessionUser | null> {
	if (!token) return null;

	const config = getPrivateEnv();
	const database = getDatabase();
	const session = await database.session.findUnique({
		where: { tokenHash: hashSessionToken(token, config.AUTH_SECRET) },
		include: { user: true }
	});

	if (!session || !session.user.isActive) return null;
	if (session.expiresAt <= new Date()) {
		await database.session.delete({ where: { id: session.id } });
		return null;
	}

	if (session.lastUsedAt < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
		await database.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
	}

	return {
		id: session.user.id,
		email: session.user.email,
		username: session.user.username,
		steamUsername: session.user.steamUsername,
		steamAvatarUrl: session.user.steamAvatarUrl,
		avatarUrl: session.user.avatarMediaId ? `/api/media/${session.user.avatarMediaId}` : null,
		discordUsername: session.user.discordUsername,
		role: session.user.role,
		avatarMediaId: session.user.avatarMediaId
	};
}

export async function destroySession(cookies: Cookies): Promise<void> {
	const token = cookies.get(SESSION_COOKIE);
	if (token) {
		await getDatabase().session.deleteMany({
			where: { tokenHash: hashSessionToken(token, getPrivateEnv().AUTH_SECRET) }
		});
	}

	cookies.delete(SESSION_COOKIE, { path: cookiePath });
}
