import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { getPrivateEnv } from './env';

let client: PrismaClient | undefined;

export function getDatabase(): PrismaClient {
	if (!client) {
		const adapter = new PrismaPg({ connectionString: getPrivateEnv().DATABASE_URL });
		client = new PrismaClient({ adapter });
	}

	return client;
}

export async function disconnectDatabase(): Promise<void> {
	if (client) {
		await client.$disconnect();
		client = undefined;
	}
}
