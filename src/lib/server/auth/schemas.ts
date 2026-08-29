import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
	password: z.string().min(1, 'Enter your password.')
});

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
		displayName: z.string().trim().max(80).optional(),
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
