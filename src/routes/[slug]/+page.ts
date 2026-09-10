import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const pages = {
	servers: {
		title: 'Game Servers',
		eyebrow: 'Yggdrasil under our banner',
		intro:
			'Yggdrasil is our Valheim world. Join at valheim.webble.se. Ask in the Discord server for the password, then use the live map below to find your way.',
		items: []
	},
	members: {
		title: 'Guild Roster',
		eyebrow: 'Members of every rank',
		intro:
			'Members will appear here with their rank, favored games, join date, and public guild biography.',
		items: ['Jarl Wolfskii — Admin', 'Freydis — Member', 'Eirik — Member']
	},
	about: {
		title: 'About Us',
		eyebrow: 'Who we are',
		intro:
			'Wolves of Ragnarok is a community built around shared adventures rather than any single game.',
		items: [
			'Ancient atmosphere, modern welcome',
			'Community before competition',
			'Many games, one longhouse'
		]
	},
	merch: {
		title: 'Wolves Merch',
		eyebrow: 'Coming soon',
		intro:
			'Wear the mark, carry the story, and represent the community wherever the next session takes you.',
		items: [
			'Hoodies with the Wolves of Ragnarok crest',
			'T-shirts for Yggdrasil nights and everyday gaming',
			'Caps, beanies, and embroidered patches',
			'Mugs and desk gear for long sessions',
			'Sticker packs and laptop decals',
			'Posters and art prints from the realm'
		]
	},
	wiki: {
		title: 'Realm Wiki',
		eyebrow: 'Search the Valheim Wiki',
		intro:
			'Look up items, creatures, biomes, crafting stations, and survival systems without leaving the hall.',
		items: []
	},
	rules: {
		title: 'Rules & Guidelines',
		eyebrow: 'Keep the hall welcoming',
		intro: 'Please read these guidelines before joining the conversation or an event.',
		items: [
			'18+ only: the community hosts alcohol-related events and conversations.',
			'Be respectful: harassment, hate speech, and discrimination are not welcome.',
			'Voice chat etiquette: do not talk over people, use push-to-talk when useful, and keep background noise low.',
			'No spamming: do not flood chat with excessive messages, links, or images.',
			'No self-promotion without permission from an administrator or moderator.',
			'Follow Discord Terms of Service and the rules of every game we play.',
			'Drinking nights are for responsible adults. Know your limits and look after one another.',
			'Need help or a private channel? Contact an administrator or moderator.'
		]
	},
	contact: {
		title: 'Contact the Hall',
		eyebrow: 'Find us online',
		intro: 'Discord is where events are planned, games are started, and most conversations happen.',
		items: [
			'Join the Discord server for event announcements and community chat.',
			'For account, moderation, or private-channel questions, contact an administrator or moderator.'
		]
	}
} as const;

export const load: PageLoad = ({ params }) => {
	const page = pages[params.slug as keyof typeof pages];
	if (!page) error(404, 'This path is lost beyond the Bifröst.');
	return { page };
};
