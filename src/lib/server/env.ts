import { env } from '$env/dynamic/private';
import { z } from 'zod';

const privateEnvSchema = z.object({
	DATABASE_URL: z.string().min(1),
	AUTH_SECRET: z.string().min(32),
	SESSION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
	SERVER_STATUS_MODE: z.enum(['mock', 'live']).default('mock'),
	SERVER_STATUS_CACHE_SECONDS: z.coerce.number().int().min(5).max(600).default(30),
	SERVER_STATUS_TIMEOUT_MS: z.coerce.number().int().min(500).max(15_000).default(3000),
	SERVER_STATUS_ALLOW_PRIVATE_HOSTS: z.stringbool().default(false),
	UPLOAD_DIR: z.string().default('./uploads'),
	MAX_UPLOAD_BYTES: z.coerce
		.number()
		.int()
		.min(1024)
		.max(20 * 1024 * 1024)
		.default(5 * 1024 * 1024)
});

let parsedEnvironment: z.infer<typeof privateEnvSchema> | undefined;

export function getPrivateEnv() {
	parsedEnvironment ??= privateEnvSchema.parse(env);
	return parsedEnvironment;
}
