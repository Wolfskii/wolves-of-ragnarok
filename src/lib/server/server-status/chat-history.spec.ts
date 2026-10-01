import { describe, expect, it } from 'vitest';
import { mergeChatHistories, presentWebsiteChat, presentWebsiteChats } from './chat-history';

const shout = {
	sequence: 1,
	playerName: 'Server',
	text: '[Grey Nomad] Var hälsad store krigare!',
	shout: true,
	unixMs: 1_700_000_000_000
};

const say = {
	sequence: 2,
	playerName: 'Freydis',
	text: 'Meet at the hall',
	shout: false,
	unixMs: 1_700_000_000_100
};

describe('chat history', () => {
	it('keeps website hall messages as ordinary says', () => {
		expect(presentWebsiteChat(shout)).toEqual({
			...shout,
			playerName: 'Grey Nomad',
			text: 'Var hälsad store krigare!',
			shout: false
		});
	});

	it('leaves in-game says and true shouts unchanged', () => {
		expect(presentWebsiteChat(say)).toEqual(say);
		expect(
			presentWebsiteChat({
				...shout,
				text: 'The forsaken stirs'
			})
		).toEqual({
			...shout,
			text: 'The forsaken stirs'
		});
	});

	it('collapses the website archive and the ValheimOne echo of one hall line', () => {
		const echo = { ...shout, sequence: 8, unixMs: shout.unixMs + 400 };
		expect(mergeChatHistories([shout], [echo])).toEqual([shout]);
	});

	it('keeps a repeated hall line that is not the immediate echo', () => {
		const later = { ...shout, sequence: 8, unixMs: shout.unixMs + 20_000 };
		expect(mergeChatHistories([shout], [later])).toEqual([shout, later]);
	});

	it('merges live chat over archived lines without duplicating fingerprints', () => {
		const older = { ...say, sequence: 9, unixMs: say.unixMs - 5_000 };
		const merged = presentWebsiteChats(mergeChatHistories([shout, older], [shout, say]));

		expect(merged).toEqual([
			presentWebsiteChat(older),
			presentWebsiteChat(shout),
			presentWebsiteChat(say)
		]);
	});
});
