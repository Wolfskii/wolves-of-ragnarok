import { describe, expect, it } from 'vitest';
import { splitPlainTextLinks } from './plain-text';

describe('splitPlainTextLinks', () => {
	it('splits a line with one URL into text and link parts', () => {
		expect(
			splitPlainTextLinks(
				'Official announcement: https://www.valheimgame.com/news/valheim-1-0-has-arrived-/'
			)
		).toEqual([
			{ kind: 'text', value: 'Official announcement: ' },
			{
				kind: 'link',
				href: 'https://www.valheimgame.com/news/valheim-1-0-has-arrived-/',
				label: 'https://www.valheimgame.com/news/valheim-1-0-has-arrived-/'
			}
		]);
	});

	it('splits multiple URLs on separate lines', () => {
		expect(
			splitPlainTextLinks('FAQ: https://example.com/faq\nMore: https://example.com/more.')
		).toEqual([
			{ kind: 'text', value: 'FAQ: ' },
			{ kind: 'link', href: 'https://example.com/faq', label: 'https://example.com/faq' },
			{ kind: 'text', value: '\nMore: ' },
			{ kind: 'link', href: 'https://example.com/more', label: 'https://example.com/more' },
			{ kind: 'text', value: '.' }
		]);
	});

	it('returns plain text when no URL is present', () => {
		expect(splitPlainTextLinks('No links here.')).toEqual([
			{ kind: 'text', value: 'No links here.' }
		]);
	});
});
