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

	const firstNews = await database.newsPost.upsert({
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
			body: '# Ashlands Expedition Muster\n\nThe next Valheim expedition is forming. Check your food, repair your gear, and bring enough portal materials for a safe return.\n\nPost your availability in the forum and we will gather a crew for the weekend.',
			status: 'PUBLISHED',
			publishedAt: new Date()
		},
		create: {
			slug: 'ashlands-expedition-muster',
			title: 'Ashlands Expedition Muster',
			excerpt:
				'Fire resistance, strong shields, and a clear plan for the next journey into the Ashlands.',
			body: '# Ashlands Expedition Muster\n\nThe next Valheim expedition is forming. Check your food, repair your gear, and bring enough portal materials for a safe return.\n\nPost your availability in the forum and we will gather a crew for the weekend.',
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

	await database.siteSettings.upsert({
		where: { id: 'default' },
		update: { featuredNewsId: firstNews.id, tagline: 'Late nights. Good games. No empty seats.' },
		create: {
			id: 'default',
			tagline: 'Late nights. Good games. No empty seats.',
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
			body: 'Welcome to Wolves of Ragnarok,\n\nWe are a community of gamers who enjoy spending time together in various online games and drinking nights. Some evenings bring a serious expedition, other evenings bring a relaxed build session, a new game, or a few hours of conversation and laughter.\n\nAs long as you are kind and want to vibe with a mixed group of people, you are welcome here. We care more about good company than perfect skill, and there is no pressure to be the loudest person in the room.\n\nWe host occasional events, organize game nights, and mostly hang out in our Discord server. Drop in, introduce yourself, and see what is happening.\n\nWelcome and skål, Viking brother!'
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
			update: { title: page.title, body: page.body, status: 'PUBLISHED', publishedAt: new Date() },
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
		where: { host_gamePort: { host: 'valheim.webble.se', gamePort: 2456 } },
		update: {
			name: 'Yggdrasil',
			description: 'The primary Valheim world of the Wolves of Ragnarok.'
		},
		create: {
			name: 'Yggdrasil',
			game: 'VALHEIM',
			adapter: 'GAMEDIG',
			host: 'valheim.webble.se',
			gamePort: 2456,
			queryPort: 2457,
			description: 'The primary Valheim world of the Wolves of Ragnarok.',
			displayOrder: 0
		}
	});

	for (const thread of [
		{
			id: '00000000-0000-0000-0000-000000000101',
			slug: 'welcome-to-the-longhouse',
			title: 'Welcome to the Longhouse',
			date: '2025-01-11T18:30:00Z',
			posts: [
				[
					'00000000-0000-0000-0000-000000000201',
					'bytebender',
					'Welcome to the new forum. Introduce yourself, share what you play, and tell us what you are building next.'
				],
				[
					'00000000-0000-0000-0000-000000000211',
					'nightshift',
					'Mostly here for co-op games and the occasional late-night movie or drinking session. Glad to see the hall open again.'
				],
				[
					'00000000-0000-0000-0000-000000000212',
					'mossybyte',
					'Same. I am bringing my Minecraft world tour screenshots and absolutely no sensible sleep schedule.'
				]
			]
		},
		{
			id: '00000000-0000-0000-0000-000000000102',
			slug: 'ashlands-expedition-planning',
			title: 'Ashlands Expedition Planning',
			date: '2025-02-15T20:00:00Z',
			posts: [
				[
					'00000000-0000-0000-0000-000000000202',
					'lagspike',
					'Who is up for an Ashlands run this weekend? Bring fire resistance, a strong shield, and portal materials.'
				],
				[
					'00000000-0000-0000-0000-000000000213',
					'toastpacket',
					'I can bring supplies and build the staging portal. I will probably get distracted making a tiny kitchen again.'
				],
				[
					'00000000-0000-0000-0000-000000000214',
					'bytebender',
					'Count me in. Saturday works, and I have finally upgraded the bow instead of spending all my iron on decor.'
				]
			]
		},
		{
			id: '00000000-0000-0000-0000-000000000103',
			slug: 'ideas-for-yggdrasil-builds',
			title: 'Ideas for Yggdrasil Builds',
			date: '2025-03-02T16:15:00Z',
			posts: [
				[
					'00000000-0000-0000-0000-000000000203',
					'toastpacket',
					'I want to expand the harbor and connect it to the mountain road. Post screenshots or sketches for the next build night.'
				],
				[
					'00000000-0000-0000-0000-000000000215',
					'sidequester',
					'A covered walkway would be useful. Also, I vote for one deliberately ridiculous tower somewhere near the docks.'
				],
				[
					'00000000-0000-0000-0000-000000000216',
					'lagspike',
					'I mapped a possible route around the swamp. The tower can go at the fork so nobody misses it.'
				]
			]
		},
		{
			id: '00000000-0000-0000-0000-000000000104',
			slug: 'minecraft-server-ideas',
			title: 'Minecraft Server Ideas',
			date: '2025-04-19T19:45:00Z',
			posts: [
				[
					'00000000-0000-0000-0000-000000000204',
					'mossybyte',
					'I found an old world backup and it made me want to bring back the Minecraft server for a short community season.'
				],
				[
					'00000000-0000-0000-0000-000000000217',
					'nightshift',
					'A smaller map with shared spawn projects could be fun. No pressure to play every night, just somewhere to drop in.'
				],
				[
					'00000000-0000-0000-0000-000000000218',
					'bytebender',
					'I still remember the railway that went nowhere. I support rebuilding it, but this time with signs.'
				]
			]
		},
		{
			id: '00000000-0000-0000-0000-000000000105',
			slug: 'friday-drinks-and-game-night',
			title: 'Friday Drinks and Game Night',
			date: '2025-06-06T18:00:00Z',
			posts: [
				[
					'00000000-0000-0000-0000-000000000205',
					'sidequester',
					'Thinking about a relaxed Friday night in Discord with a few games afterward. Bring a drink, snacks, or just yourself.'
				],
				[
					'00000000-0000-0000-0000-000000000219',
					'toastpacket',
					'I am in. I can host a co-op lobby after the first round of questionable music choices.'
				],
				[
					'00000000-0000-0000-0000-000000000220',
					'mossybyte',
					'I will arrive late, but I will bring the playlist and a strong opinion about what counts as a game night.'
				]
			]
		},
		{
			id: '00000000-0000-0000-0000-000000000106',
			slug: 'what-are-we-playing-next',
			title: 'What Are We Playing Next?',
			date: '2025-09-13T14:20:00Z',
			posts: [
				[
					'00000000-0000-0000-0000-000000000206',
					'nightshift',
					'Valheim and Minecraft are both calling, but I would also be up for trying something completely new together.'
				],
				[
					'00000000-0000-0000-0000-000000000221',
					'lagspike',
					'A rotating game night might work: one familiar game, one experiment, and no obligation to finish either.'
				],
				[
					'00000000-0000-0000-0000-000000000222',
					'sidequester',
					'Perfect format. I vote we decide in Discord and keep the forum for the overly detailed plans.'
				]
			]
		}
	]) {
		const firstAuthor = demoUsers.get(thread.posts[0]![1]);
		if (!firstAuthor) throw new Error(`Missing seeded forum author ${thread.posts[0]![1]}.`);
		const date = new Date(thread.date);
		const savedThread = await database.forumThread.upsert({
			where: { slug: thread.slug },
			update: { title: thread.title, authorId: firstAuthor.id, createdAt: date, updatedAt: date },
			create: {
				id: thread.id,
				slug: thread.slug,
				title: thread.title,
				authorId: firstAuthor.id,
				createdAt: date,
				updatedAt: date
			}
		});
		for (const [postId, username, body] of thread.posts) {
			const author = demoUsers.get(username);
			if (!author) throw new Error(`Missing seeded forum author ${username}.`);
			await database.forumPost.upsert({
				where: { id: postId },
				update: { body, authorId: author.id, threadId: savedThread.id, createdAt: date },
				create: { id: postId, body, authorId: author.id, threadId: savedThread.id, createdAt: date }
			});
		}
	}

	console.log(`Seeded Wolves of Ragnarok with admin ${admin.email}.`);
} finally {
	await database.$disconnect();
}
