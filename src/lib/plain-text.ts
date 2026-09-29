export type PlainTextPart =
	| { kind: 'text'; value: string }
	| { kind: 'link'; href: string; label: string };

const URL_PATTERN = /\bhttps?:\/\/[^\s<>"']+/gi;

function trimTrailingPunctuation(value: string): string {
	return value.replace(/[),.;!?]+$/, '');
}

function parseHttpUrl(value: string): string | null {
	try {
		const url = new URL(value);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
		return url.toString();
	} catch {
		return null;
	}
}

export function splitPlainTextLinks(text: string): PlainTextPart[] {
	const parts: PlainTextPart[] = [];
	let lastIndex = 0;

	for (const match of text.matchAll(URL_PATTERN)) {
		const raw = match[0];
		const index = match.index ?? 0;
		const label = trimTrailingPunctuation(raw);
		const href = parseHttpUrl(label);

		if (!href) {
			continue;
		}

		if (index > lastIndex) {
			parts.push({ kind: 'text', value: text.slice(lastIndex, index) });
		}

		parts.push({ kind: 'link', href, label });

		const trailing = raw.slice(label.length);
		if (trailing) {
			parts.push({ kind: 'text', value: trailing });
		}

		lastIndex = index + raw.length;
	}

	if (lastIndex < text.length) {
		parts.push({ kind: 'text', value: text.slice(lastIndex) });
	}

	return parts.length ? parts : [{ kind: 'text', value: text }];
}
