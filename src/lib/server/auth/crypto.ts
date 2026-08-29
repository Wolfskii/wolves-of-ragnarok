import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';

const passwordOptions = {
	algorithm: 2,
	memoryCost: 19_456,
	timeCost: 2,
	parallelism: 1,
	outputLen: 32
} as const;

export function createSessionToken(): string {
	return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string, secret: string): string {
	return createHmac('sha256', secret).update(token).digest('hex');
}

export function sessionHashesMatch(left: string, right: string): boolean {
	const leftBuffer = Buffer.from(left, 'hex');
	const rightBuffer = Buffer.from(right, 'hex');

	return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function hashPassword(password: string): Promise<string> {
	return hash(password, passwordOptions);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
	return verify(passwordHash, password);
}
