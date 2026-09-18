export const ADVENTURER_NAME_KEY = 'wolves-of-ragnarok:chat-name:v1';

const adjectives = [
	'Lone',
	'Lost',
	'Frostborn',
	'Ashen',
	'Silent',
	'Wild',
	'Grim',
	'Brave',
	'Weary',
	'Stormborn',
	'Rune-marked',
	'Ironbound',
	'Pale',
	'Hollow',
	'Feral',
	'Oathbound',
	'Windworn',
	'Night',
	'Dawn',
	'Blooded',
	'Seaborn',
	'Wolfkin',
	'Raven-eyed',
	'Shieldless',
	'Wayward',
	'Winter',
	'Ember',
	'Salt',
	'Moonlit',
	'Sun-scarred',
	'Ghost',
	'Sworn',
	'Unburied',
	'Far-faring',
	'Icebound',
	'Thunder',
	'Quiet',
	'Red',
	'Grey',
	'Old',
	'Snowblind',
	'Mead-drunk',
	'Fatebound',
	'Wolf-blood',
	'Battle-worn',
	'Hearthless',
	'Keen-eyed',
	'Iron-willed'
] as const;

const roles = [
	'Adventurer',
	'Warrior',
	'Scout',
	'Hunter',
	'Wanderer',
	'Raider',
	'Skald',
	'Shieldmaiden',
	'Berserker',
	'Seeker',
	'Wolf',
	'Raven',
	'Exile',
	'Thrall',
	'Jarl',
	'Shieldbearer',
	'Spearman',
	'Archer',
	'Drifter',
	'Pathfinder',
	'Outrider',
	'Reaver',
	'Sailor',
	'Woodsman',
	'Runecaster',
	'Smith',
	'Watcher',
	'Herald',
	'Champion',
	'Warden',
	'Nomad',
	'Rider',
	'Axeman',
	'Bowman',
	'Seafarer',
	'Valkyrie',
	'Huscarl',
	'Bondi',
	'Viking',
	'Shield-breaker',
	'Oathkeeper',
	'Wayfinder',
	'Stag',
	'Bear',
	'Crow'
] as const;

const patrons = [
	'Odin',
	'Thor',
	'Freyja',
	'Loki',
	'Tyr',
	'Heimdall',
	'Frigg',
	'Baldr',
	'Skadi',
	'Hel',
	'Fenrir',
	'Jormungandr',
	'Sleipnir',
	'Huginn',
	'Muninn',
	'Idunn',
	'Njord',
	'Bragi',
	'Forseti',
	'Vidar',
	'Freyr',
	'Ullr',
	'Ran',
	'Aegir',
	'Sif',
	'Nanna',
	'Hod',
	'Vali',
	'Magni',
	'Modi',
	'Eir',
	'Saga',
	'Fulla',
	'Var',
	'Syn'
] as const;

const places = [
	'Midgard',
	'Asgard',
	'Helheim',
	'Niflheim',
	'Muspelheim',
	'Jotunheim',
	'Vanaheim',
	'Alfheim',
	'Yggdrasil',
	'Valhalla',
	'Folkvangr',
	'the Fjords',
	'the Ashlands',
	'the North',
	'Utgard',
	'Kattegat',
	'Bifrost',
	'the Wilds',
	'the Meadhall',
	'the Longhouse',
	'Nidavellir',
	'Ginnungagap',
	'the Deep North',
	'Jarnvidr',
	'Hlidskjalf'
] as const;

function pick<T>(items: readonly T[], random: () => number): T {
	return items[Math.floor(random() * items.length)] ?? items[0];
}

function numberTag(random: () => number): number {
	return 1 + Math.floor(random() * 999);
}

function composeName(random: () => number): string {
	const adjective = pick(adjectives, random);
	const role = pick(roles, random);
	const patron = pick(patrons, random);
	const place = pick(places, random);
	const tag = numberTag(random);
	const roll = random();

	if (roll < 0.28) return `${adjective} ${role} ${tag}`;
	if (roll < 0.5) return `${patron}'s ${role}`;
	if (roll < 0.66) return `${role} of ${place}`;
	if (roll < 0.76) return `${adjective} ${role}`;
	if (roll < 0.84) return `Lone ${role} ${tag}`;
	if (roll < 0.9) return `Child of ${patron}`;
	if (roll < 0.95) return `${adjective} kin of ${patron}`;
	return `${role} from ${place}`;
}

export function generateAdventurerName(random: () => number = Math.random): string {
	for (let attempt = 0; attempt < 16; attempt += 1) {
		const name = composeName(random).replace(/\s+/g, ' ').trim();
		if (name.length >= 4 && name.length <= 32) return name;
	}
	return `Lone Adventurer ${numberTag(random)}`;
}

export function loadAdventurerName(storage: Storage = window.localStorage): string {
	const stored = storage.getItem(ADVENTURER_NAME_KEY)?.replace(/\s+/g, ' ').trim() ?? '';
	if (stored.length >= 4 && stored.length <= 32) return stored;
	const name = generateAdventurerName();
	storage.setItem(ADVENTURER_NAME_KEY, name);
	return name;
}
