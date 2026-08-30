import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword } from '../src/lib/server/auth/crypto';

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

if (!databaseUrl) throw new Error('DATABASE_URL is required to seed the database.');
if (!adminEmail || !adminEmail.includes('@'))
	throw new Error('ADMIN_EMAIL must be a valid email address.');
if (!adminUsername || !/^[a-z0-9_-]{3,32}$/.test(adminUsername)) {
	throw new Error(
		'ADMIN_USERNAME must be 3-32 lowercase letters, numbers, underscores, or hyphens.'
	);
}
if (!adminPassword || adminPassword.length < 12) {
	throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const database = new PrismaClient({ adapter });

try {
	const admin = await database.user.upsert({
		where: { email: adminEmail },
		update: {
			username: adminUsername,
			passwordHash: await hashPassword(adminPassword),
			role: 'ADMIN',
			isActive: true,
			lastSeenAt: new Date()
		},
		create: {
			email: adminEmail,
			username: adminUsername,
			passwordHash: await hashPassword(adminPassword),
			role: 'ADMIN',
			bio: 'Keeper of the longhouse and first among the Wolves of Ragnarok.',
			lastSeenAt: new Date(),
			activities: { create: { type: 'JOINED', summary: 'Founded the Wolves of Ragnarok.' } }
		}
	});

	const firstNews = await database.newsPost.upsert({
		where: { slug: 'the-longhouse-doors-open' },
		update: {},
		create: {
			slug: 'the-longhouse-doors-open',
			title: 'The Longhouse Doors Open',
			excerpt: 'Our new hall has risen between pine and mountain.',
			body: '# The Longhouse Doors Open\n\nClaim your place by the hearth and prepare for the next expedition.',
			status: 'PUBLISHED',
			publishedAt: new Date(),
			authorId: admin.id
		}
	});

	await database.newsPost.upsert({
		where: { slug: 'ashlands-expedition-muster' },
		update: {},
		create: {
			slug: 'ashlands-expedition-muster',
			title: 'Ashlands Expedition Muster',
			excerpt: 'Bring fire resistance, your strongest shield, and portal materials.',
			body: '# Ashlands Expedition Muster\n\nThe war council gathers at dusk.',
			status: 'DRAFT',
			authorId: admin.id
		}
	});

	await database.siteSettings.upsert({
		where: { id: 'default' },
		update: { featuredNewsId: firstNews.id },
		create: {
			id: 'default',
			heroHeading: 'Stand with the pack',
			heroBody: 'We are a fellowship of builders, raiders, wanderers, and storytellers.',
			communityIntroduction: 'Many games. One longhouse.',
			seoDescription:
				'A Norse gaming community where adventurers gather and face the end of worlds together.',
			featuredNewsId: firstNews.id
		}
	});

	for (const page of [
		{
			slug: 'about',
			title: 'Our Saga',
			body: '# Our Saga\n\nThe Wolves gather beneath one banner.'
		},
		{
			slug: 'rules',
			title: 'Oath and Law',
			body: '# Oath and Law\n\nRespect the pack and protect the hall.'
		},
		{
			slug: 'community',
			title: 'The Longhouse',
			body: '# The Longhouse\n\nA welcoming home for adventurers.'
		}
	]) {
		await database.page.upsert({
			where: { slug: page.slug },
			update: {},
			create: { ...page, status: 'PUBLISHED', publishedAt: new Date(), authorId: admin.id }
		});
	}

	await database.communityLink.upsert({
		where: { id: '00000000-0000-0000-0000-000000000001' },
		update: { url: 'https://discord.gg/CbjgD7WVfp' },
		create: {
			id: '00000000-0000-0000-0000-000000000001',
			label: 'Discord',
			url: 'https://discord.gg/CbjgD7WVfp',
			kind: 'discord',
			displayOrder: 0
		}
	});

	await database.server.upsert({
		where: { host_gamePort: { host: 'valheim.example.com', gamePort: 2456 } },
		update: {},
		create: {
			name: "The Wolves' Den",
			game: 'VALHEIM',
			adapter: 'MOCK',
			host: 'valheim.example.com',
			gamePort: 2456,
			queryPort: 2457,
			description: 'The primary Valheim world of the Wolves of Ragnarok.',
			displayOrder: 0
		}
	});

	console.log(`Seeded Wolves of Ragnarok with admin ${admin.email}.`);
} finally {
	await database.$disconnect();
}
