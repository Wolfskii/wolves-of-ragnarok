import 'dotenv/config';
import { randomBytes } from 'node:crypto';
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

	const demoPasswordHash = await hashPassword(randomBytes(32).toString('hex'));
	const demoUsers = new Map<string, { id: string }>();
	for (const user of [
		{
			email: 'freydis@wolvesofragnarok.local',
			username: 'bytebender',
			bio: 'Builder, explorer, and screenshot collector.'
		},
		{
			email: 'eirik@wolvesofragnarok.local',
			username: 'lagspike',
			bio: 'Map keeper, server tinkerer, and reluctant navigator.'
		},
		{
			email: 'ulf@wolvesofragnarok.local',
			username: 'toastpacket',
			bio: 'Harbor builder, late-night gamer, and food buff enthusiast.'
		},
		{
			email: 'nightshift@wolvesofragnarok.local',
			username: 'nightshift',
			bio: 'Usually online after midnight with too many building ideas.'
		},
		{
			email: 'mossybyte@wolvesofragnarok.local',
			username: 'mossybyte',
			bio: 'Minecraft redstone tinkerer and occasional raid planner.'
		},
		{
			email: 'sidequester@wolvesofragnarok.local',
			username: 'sidequester',
			bio: 'Always one small detour away from the main objective.'
		}
	]) {
		const demoUser = await database.user.upsert({
			where: { email: user.email },
			update: { username: user.username, isActive: true, bio: user.bio },
			create: {
				email: user.email,
				username: user.username,
				passwordHash: demoPasswordHash,
				bio: user.bio,
				lastSeenAt: new Date()
			}
		});
		demoUsers.set(user.username, demoUser);
	}

	await database.newsPost.upsert({
		where: { slug: 'the-longhouse-doors-open' },
		update: {
			excerpt: 'The doors are open: find your people, choose a game, and settle in by the fire.',
			body: '# The Longhouse Doors Open\n\nWelcome to Wolves of Ragnarok. We are a community of gamers who enjoy spending time together across many online worlds, from Valheim expeditions to relaxed evenings in Discord.\n\nBring your curiosity, your best stories, and whatever game has your attention this week. The hall is open.'
		},
		create: {
			slug: 'the-longhouse-doors-open',
			title: 'The Longhouse Doors Open',
			excerpt: 'The doors are open: find your people, choose a game, and settle in by the fire.',
			body: '# The Longhouse Doors Open\n\nWelcome to Wolves of Ragnarok. We are a community of gamers who enjoy spending time together across many online worlds, from Valheim expeditions to relaxed evenings in Discord.\n\nBring your curiosity, your best stories, and whatever game has your attention this week. The hall is open.',
			status: 'PUBLISHED',
			publishedAt: new Date(),
			authorId: admin.id
		}
	});

	await database.newsPost.upsert({
		where: { slug: 'ashlands-expedition-muster' },
		update: {
			excerpt:
				'Fire resistance, strong shields, and a clear plan for the next journey into the Ashlands.',
			body: '# Ashlands Expedition Muster\n\nThe next Valheim expedition is forming. Check your food, repair your gear, and bring enough portal materials for a safe return.\n\nPost your availability in Discord and we will gather a crew for the weekend.',
			status: 'PUBLISHED',
			publishedAt: new Date()
		},
		create: {
			slug: 'ashlands-expedition-muster',
			title: 'Ashlands Expedition Muster',
			excerpt:
				'Fire resistance, strong shields, and a clear plan for the next journey into the Ashlands.',
			body: '# Ashlands Expedition Muster\n\nThe next Valheim expedition is forming. Check your food, repair your gear, and bring enough portal materials for a safe return.\n\nPost your availability in Discord and we will gather a crew for the weekend.',
			status: 'PUBLISHED',
			publishedAt: new Date(),
			authorId: admin.id
		}
	});

	await database.newsPost.upsert({
		where: { slug: 'welcome-and-skal' },
		update: {
			excerpt:
				'A warm welcome to new players, returning friends, and everyone looking for a good evening online.',
			body: '# Welcome and skål\n\nAs long as you are kind and ready to vibe with a mixed group of people, there is a place for you here. We host occasional events, share game nights, and spend most evenings together in our Discord server.\n\nWelcome to the hall, and skål, Viking brother.'
		},
		create: {
			slug: 'welcome-and-skal',
			title: 'Welcome and skål',
			excerpt:
				'A warm welcome to new players, returning friends, and everyone looking for a good evening online.',
			body: '# Welcome and skål\n\nAs long as you are kind and ready to vibe with a mixed group of people, there is a place for you here. We host occasional events, share game nights, and spend most evenings together in our Discord server.\n\nWelcome to the hall, and skål, Viking brother.',
			status: 'PUBLISHED',
			publishedAt: new Date(),
			authorId: admin.id
		}
	});
	console.log(`Seeded Wolves of Ragnarok with admin ${admin.email}.`);
} finally {
	await database.$disconnect();
}
