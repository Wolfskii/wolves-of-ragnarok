import { describe, expect, it } from 'vitest';
import { createSessionToken, hashPassword, hashSessionToken, verifyPassword } from './crypto';
import { loginSchema, registrationSchema } from './schemas';

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
			displayName: 'Night Wolf',
			password: 'a-long-winter-password',
			confirmPassword: 'a-long-winter-password'
		});

		expect(result.email).toBe('wolf@example.com');
		expect(result.username).toBe('night_wolf');
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
		const result = loginSchema.parse({ email: ' WOLF@EXAMPLE.COM ', password: ' CaseMatters ' });

		expect(result).toEqual({ email: 'wolf@example.com', password: ' CaseMatters ' });
	});
});
