import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './crypto';
import { loginSchema, registrationSchema } from './schemas';
import { fetchSteamProfile } from '../steam';

afterEach(() => vi.unstubAllGlobals());

describe('authentication cryptography', () => {
	it('hashes passwords with Argon2id and verifies only the original password', async () => {
		const passwordHash = await hashPassword('a-long-winter-password');

		expect(passwordHash).toContain('$argon2id$');
		await expect(verifyPassword(passwordHash, 'a-long-winter-password')).resolves.toBe(true);
		await expect(verifyPassword(passwordHash, 'a-different-password')).resolves.toBe(false);
	});

	it('creates opaque tokens and protects stored values with a keyed hash', () => {
		const token = createSessionToken();
		const firstHash = hashSessionToken(token, '0123456789abcdef0123456789abcdef');
		const secondHash = hashSessionToken(token, 'fedcba9876543210fedcba9876543210');

		expect(token.length).toBeGreaterThanOrEqual(40);
		expect(firstHash).toHaveLength(64);
		expect(firstHash).not.toBe(token);
		expect(firstHash).not.toBe(secondHash);
	});
});

describe('authentication input', () => {
	it('normalizes account identifiers', () => {
		const result = registrationSchema.parse({
			email: '  WOLF@EXAMPLE.COM ',
			username: '  Night_Wolf ',
			steamProfileUrl: '',
			password: 'a-long-winter-password',
			confirmPassword: 'a-long-winter-password'
		});

		expect(result.email).toBe('wolf@example.com');
		expect(result.username).toBe('night_wolf');
		expect(result.steamProfileUrl).toBeUndefined();
	});

	it('accepts Steam community profile links and fetches profile metadata', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				new Response(
					`<profile><steamID><![CDATA[Valheim Viking]]></steamID><avatarFull><![CDATA[https://avatars.akamai.steamstatic.com/avatar_full.jpg]]></avatarFull></profile>`,
					{ status: 200 }
				)
			);
		vi.stubGlobal('fetch', fetchMock);

		expect(
			registrationSchema.parse({
				email: 'viking@example.com',
				username: 'viking',
				steamProfileUrl: 'https://steamcommunity.com/id/viking',
				password: 'a-long-winter-password',
				confirmPassword: 'a-long-winter-password'
			}).steamProfileUrl
		).toBe('https://steamcommunity.com/id/viking');
		await expect(fetchSteamProfile('https://steamcommunity.com/id/viking')).resolves.toEqual({
			username: 'Valheim Viking',
			avatarUrl: 'https://avatars.akamai.steamstatic.com/avatar_full.jpg'
		});
		expect(fetchMock.mock.calls[0]?.[0]).toBe('https://steamcommunity.com/id/viking?xml=1');
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
			headers: { accept: 'application/xml, text/xml' }
		});
	});

	it('rejects non-Steam profile URLs', () => {
		const result = registrationSchema.safeParse({
			email: 'viking@example.com',
			username: 'viking',
			steamProfileUrl: 'https://example.com/viking',
			password: 'a-long-winter-password',
			confirmPassword: 'a-long-winter-password'
		});

		expect(result.success).toBe(false);
	});

	it('rejects short passwords and mismatched confirmation', () => {
		const result = registrationSchema.safeParse({
			email: 'wolf@example.com',
			username: 'wolf',
			password: 'short',
			confirmPassword: 'different'
		});

		expect(result.success).toBe(false);
	});

	it('normalizes login email without weakening password input', () => {
		const result = loginSchema.parse({
			identifier: ' WOLF@EXAMPLE.COM ',
			password: ' CaseMatters '
		});

		expect(result).toEqual({ identifier: 'wolf@example.com', password: ' CaseMatters ' });
	});

	it('accepts a username as a login identifier', () => {
		expect(loginSchema.parse({ identifier: ' Night_Wolf ', password: 'secret' }).identifier).toBe(
			'night_wolf'
		);
	});
});
