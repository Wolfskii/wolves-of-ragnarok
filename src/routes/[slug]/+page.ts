import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const pages = {
	news: {
		title: 'Latest Chronicles',
		eyebrow: 'News from across the realms',
		intro: 'Campaign reports, community announcements, and tales carried home from distant worlds.',
		items: ['The Longhouse Doors Open', 'Ashlands Expedition Muster', 'New Wolves Join the Pack']
	},
	community: {
		title: 'The Longhouse',
		eyebrow: 'Where the pack gathers',
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
		eyebrow: 'Wolves of every rank',
		intro:
			'Members will appear here with their rank, favored games, join date, and public guild biography.',
		items: ['Jarl Wolfskii — Admin', 'Freydis — Member', 'Eirik — Member']
	},
	about: {
		title: 'Our Saga',
		eyebrow: 'The story of the pack',
		intro:
			'Wolves of Ragnarok is a community built around shared adventures rather than any single game.',
		items: [
			'Ancient atmosphere, modern welcome',
			'Community before competition',
			'Many games, one longhouse'
		]
	},
	rules: {
		title: 'Oath and Law',
		eyebrow: 'The code of the longhouse',
		intro: 'Respect the pack, protect the hall, and leave every world better than you found it.',
		items: [
			'Treat every member with dignity',
			'No harassment, cheating, or hate',
			'Help new wolves find their footing'
		]
	},
	contact: {
		title: 'Send a Raven',
		eyebrow: 'Contact the war council',
		intro: 'Community contact details will be configured by the site administrators.',
		items: ['Discord is the primary community channel']
	}
} as const;

export const load: PageLoad = ({ params }) => {
	const page = pages[params.slug as keyof typeof pages];
	if (!page) error(404, 'This path is lost beyond the Bifröst.');
	return { page };
};
