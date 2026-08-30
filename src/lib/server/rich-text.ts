import sanitizeHtml from 'sanitize-html';

const options: sanitizeHtml.IOptions = {
	allowedTags: [
		'p',
		'br',
		'strong',
		'em',
		'u',
		's',
		'h2',
		'h3',
		'ul',
		'ol',
		'li',
		'blockquote',
		'pre',
		'code',
		'a',
		'img'
	],
	allowedAttributes: {
		a: ['href', 'target', 'rel'],
		img: ['src', 'alt', 'width', 'height']
	},
	allowedSchemes: ['http', 'https'],
	allowProtocolRelative: false
};

export function sanitizeRichText(value: string): string {
	return sanitizeHtml(value, options).trim();
}

export function hasRichTextContent(value: string): boolean {
	return (
		sanitizeRichText(value)
			.replace(/<[^>]*>/g, '')
			.trim().length > 0 || /<img\b/i.test(value)
	);
}
