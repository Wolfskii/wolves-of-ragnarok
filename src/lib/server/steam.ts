type SteamProfile = {
	username: string | null;
	avatarUrl: string | null;
};

function readXmlTag(xml: string, tag: string): string | null {
	const match = xml.match(
		new RegExp(`<${tag}>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))</${tag}>`)
	);
	const value = (match?.[1] ?? match?.[2] ?? '').trim();
	return value || null;
}

function safeAvatarUrl(value: string | null): string | null {
	if (!value) return null;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' && url.hostname.endsWith('steamstatic.com')
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

export async function fetchSteamProfile(profileUrl: string): Promise<SteamProfile> {
	const url = new URL(profileUrl);
	url.searchParams.set('xml', '1');
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);

	try {
		const response = await fetch(url.toString(), {
			signal: controller.signal,
			headers: { accept: 'application/xml, text/xml' }
		});
		if (!response.ok) return { username: null, avatarUrl: null };
		const xml = await response.text();
		return {
			username: readXmlTag(xml, 'steamID')?.slice(0, 80) ?? null,
			avatarUrl: safeAvatarUrl(readXmlTag(xml, 'avatarFull'))
		};
	} catch {
		return { username: null, avatarUrl: null };
	} finally {
		clearTimeout(timeout);
	}
}
