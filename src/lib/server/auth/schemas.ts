import { z } from 'zod';

export const optionalSteamProfileUrl = z.preprocess(
	(value) => (typeof value === 'string' && !value.trim() ? undefined : value),
	z
		.string()
		.trim()
		.max(500, 'Steam profile URL is too long.')
		.url('Enter a valid Steam profile URL.')
		.refine((value) => {
			try {
				const url = new URL(value);
				return (
					url.protocol === 'https:' &&
					['steamcommunity.com', 'www.steamcommunity.com'].includes(url.hostname) &&
					/^\/(id|profiles)\/[^/]+\/?$/.test(url.pathname)
				);
			} catch {
				return false;
			}
		}, 'Use a Steam community profile URL.')
		.optional()
);

export const loginSchema = z.object({
	identifier: z.string().trim().toLowerCase().min(1, 'Enter your email or username.'),
	password: z.string().min(1, 'Enter your password.')
});

export const optionalDiscordUsername = z.preprocess(
	(value) => (typeof value === 'string' && !value.trim() ? undefined : value),
	z.string().trim().max(32, 'Discord username is too long.').optional()
);

export const registrationSchema = z
	.object({
		email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
		username: z
			.string()
			.trim()
			.toLowerCase()
			.min(3, 'Username must contain at least 3 characters.')
			.max(32, 'Username must contain at most 32 characters.')
			.regex(/^[a-z0-9_-]+$/, 'Use letters, numbers, underscores, or hyphens only.'),
		steamProfileUrl: optionalSteamProfileUrl,
		discordUsername: optionalDiscordUsername,
		password: z
			.string()
			.min(12, 'Password must contain at least 12 characters.')
			.max(128, 'Password must contain at most 128 characters.'),
		confirmPassword: z.string()
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	});
