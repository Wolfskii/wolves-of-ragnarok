import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const pages = {
	news: {
		title: 'Latest Chronicles',
		eyebrow: 'News from across the realms',
		intro: 'Campaign reports, community announcements, and tales carried home from distant worlds.',
		items: ['The Longhouse Doors Open', 'Ashlands Expedition Muster', 'New Members Enter the Hall']
	},
	community: {
		title: 'The Longhouse',
		eyebrow: 'Where the guild gathers',
		intro:
			'A welcoming home for builders, raiders, explorers, and storytellers who value good company.',
		items: ['Weekly game nights', 'Community expeditions', 'Discord gatherings']
	},
	servers: {
		title: 'Game Servers',
		eyebrow: 'Yggdrasil under our banner',
		intro:
			'Yggdrasil is our Valheim world. Live health, current players, join address, and the world map are shown below.',
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
