import { json } from '@sveltejs/kit';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const WIKI_API = 'https://valheim.fandom.com/api.php';
const WIKI_ORIGIN = 'https://valheim.fandom.com';
const searchSchema = z.string().trim().min(2).max(80);

type SearchPage = { pageid: number; title: string };
type SearchResponse = { query?: { search?: SearchPage[] } };
type ParseResponse = { parse?: { text?: { '*': string }; images?: string[] } };
type ImageResponse = {
	query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }> };
};

async function fetchWiki(params: URLSearchParams): Promise<unknown> {
	const response = await fetch(`${WIKI_API}?${params}`, {
		headers: { accept: 'application/json', 'user-agent': 'WolvesOfRagnarok/1.0 wiki search' },
		signal: AbortSignal.timeout(8000)
	});
	if (!response.ok) throw new Error(`Wiki request failed with ${response.status}.`);
	return response.json();
}

function plainText(html: string): string {
	return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
}

async function getPageDetails(page: SearchPage) {
	const parsed = (await fetchWiki(
		new URLSearchParams({
			action: 'parse',
			pageid: String(page.pageid),
			prop: 'text|images',
			format: 'json',
			disablelimitreport: '1'
		})
	)) as ParseResponse;
	const content = plainText(parsed.parse?.text?.['*'] ?? '').slice(0, 12000);
	const excerpt = content.slice(0, 520);
	let imageUrl: string | null = null;
	const imageName = parsed.parse?.images?.find((image) => !/\.svg$/i.test(image));

	if (imageName) {
		const imageData = (await fetchWiki(
			new URLSearchParams({
				action: 'query',
				titles: `File:${imageName}`,
				prop: 'imageinfo',
				iiprop: 'url',
				iiurlwidth: '480',
				format: 'json'
			})
		)) as ImageResponse;
		const imageInfo = Object.values(imageData.query?.pages ?? {})[0]?.imageinfo?.[0];
		imageUrl = imageInfo?.thumburl ?? imageInfo?.url ?? null;
	}

	return {
		title: page.title,
		excerpt: excerpt || 'Open the Valheim Wiki article for the full field guide entry.',
		content: content || excerpt,
		imageUrl,
		url: `${WIKI_ORIGIN}/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`
	};
}

export const GET: RequestHandler = async ({ url, setHeaders }) => {
	const parsed = searchSchema.safeParse(url.searchParams.get('q') ?? '');
	if (!parsed.success)
		return json({ error: 'Search for at least two characters.' }, { status: 400 });

	try {
		const searchData = (await fetchWiki(
			new URLSearchParams({
				action: 'query',
				list: 'search',
				srsearch: parsed.data,
				srlimit: '6',
				srnamespace: '0',
				format: 'json'
			})
		)) as SearchResponse;
		const results = await Promise.all((searchData.query?.search ?? []).map(getPageDetails));
		setHeaders({ 'cache-control': 'public, max-age=300, stale-while-revalidate=600' });
		return json({ source: WIKI_ORIGIN, query: parsed.data, results });
	} catch {
		return json(
			{ error: 'The Valheim Wiki could not be reached. Try again in a moment.' },
			{ status: 502 }
		);
	}
};
