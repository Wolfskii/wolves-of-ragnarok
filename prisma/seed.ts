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

	const valheimReleaseBody = `# Valheim 1.0 Has Arrived

Iron Gate has released Valheim 1.0 and opened the road into the Deep North. This is the beginning of a new chapter for every survivor still carrying a hammer, shield, or half-finished plan into the tenth world.

## What was added in Valheim 1.0

### The Deep North

- A brand-new Deep North biome.
- New locations to discover.
- New creatures and events.
- New mechanics and music.

### Weapons and equipment

- 40+ new weapons.
- New bombs and ammunition.
- Four new armor sets.
- Two new capes and two new trinkets.
- New tools.
- Upgradeable pockets.

### Building, crafting, and food

- 80+ new buildable pieces.
- Five new crafting-related build pieces.
- 30+ new crafting materials.
- 20+ new food items.
- New locations, events, and achievements.

## Our first expedition

We will be taking the Wolves into the Deep North together. Bring warmth, supplies, and a willingness to learn the new threats as a group. Use Discord to organize your first run and share what you discover.

Official announcement: https://www.valheimgame.com/news/valheim-1-0-has-arrived-/
Official 1.0 FAQ: https://www.valheimgame.com/support/valheim-1-0-faq`;

	await database.newsPost.upsert({
		where: { slug: 'valheim-1-0-has-arrived' },
		update: {
			excerpt:
				'Valheim 1.0 is live. The Deep North is open, with new threats, tools, building pieces, and reasons to gather the pack.',
			body: valheimReleaseBody
		},
		create: {
			slug: 'valheim-1-0-has-arrived',
			title: 'Valheim 1.0 Has Arrived',
			excerpt:
				'Valheim 1.0 is live. The Deep North is open, with new threats, tools, building pieces, and reasons to gather the pack.',
			body: valheimReleaseBody,
			status: 'PUBLISHED',
			publishedAt: new Date('2026-09-09T12:00:00Z'),
			authorId: admin.id
		}
	});

	await database.newsPost.upsert({
		where: { slug: 'the-longhouse-doors-open' },
		update: {
			excerpt: 'The doors are open: find your people, choose a game, and settle in by the fire.',
			body: '# The Longhouse Doors Open\n\nWelcome to Wolves of Ragnarok. We are a community of gamers who enjoy spending time together across many online worlds, from Valheim expeditions to relaxed evenings in Discord.\n\nBring your curiosity, your best stories, and whatever game has your attention this week. The hall is open.',
			publishedAt: new Date('2026-08-29T12:00:00Z')
		},
		create: {
			slug: 'the-longhouse-doors-open',
			title: 'The Longhouse Doors Open',
			excerpt: 'The doors are open: find your people, choose a game, and settle in by the fire.',
			body: '# The Longhouse Doors Open\n\nWelcome to Wolves of Ragnarok. We are a community of gamers who enjoy spending time together across many online worlds, from Valheim expeditions to relaxed evenings in Discord.\n\nBring your curiosity, your best stories, and whatever game has your attention this week. The hall is open.',
			status: 'PUBLISHED',
			publishedAt: new Date('2026-08-29T12:00:00Z'),
			authorId: admin.id
		}
	});

	await database.newsPost.upsert({
		where: { slug: 'ashlands-expedition-muster' },
		update: {
			excerpt:
				'Fire resistance, strong shields, and a clear plan for the next journey into the Ashlands.',
			body: '# Ashlands Expedition Muster\n\nThe next Valheim expedition is forming. Check your food, repair your gear, and bring enough portal materials for a safe return.\n\nPost your availability in Discord and we will gather a crew for the weekend.',
			publishedAt: new Date('2026-08-27T12:00:00Z'),
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
			publishedAt: new Date('2026-08-27T12:00:00Z'),
			authorId: admin.id
		}
	});

	await database.newsPost.upsert({
		where: { slug: 'welcome-and-skal' },
		update: {
			excerpt:
				'A warm welcome to new players, returning friends, and everyone looking for a good evening online.',
			body: '# Welcome and skål\n\nAs long as you are kind and ready to vibe with a mixed group of people, there is a place for you here. We host occasional events, share game nights, and spend most evenings together in our Discord server.\n\nWelcome to the hall, and skål, Viking brother.',
			publishedAt: new Date('2026-08-24T12:00:00Z')
		},
		create: {
			slug: 'welcome-and-skal',
			title: 'Welcome and skål',
			excerpt:
				'A warm welcome to new players, returning friends, and everyone looking for a good evening online.',
			body: '# Welcome and skål\n\nAs long as you are kind and ready to vibe with a mixed group of people, there is a place for you here. We host occasional events, share game nights, and spend most evenings together in our Discord server.\n\nWelcome to the hall, and skål, Viking brother.',
			status: 'PUBLISHED',
			publishedAt: new Date('2026-08-24T12:00:00Z'),
			authorId: admin.id
		}
	});

	await database.newsPost.deleteMany({
		where: {
			slug: { in: ['the-longhouse-doors-open', 'ashlands-expedition-muster', 'welcome-and-skal'] }
		}
	});
	console.log(`Seeded Wolves of Ragnarok with admin ${admin.email}.`);
} finally {
	await database.$disconnect();
}
