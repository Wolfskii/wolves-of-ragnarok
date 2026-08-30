import { describe, expect, it } from 'vitest';
import { hasRichTextContent, sanitizeRichText } from './rich-text';

describe('rich text', () => {
	it('keeps supported formatting and media while removing executable markup', () => {
		const result = sanitizeRichText(
			'<p><strong>Ready</strong></p><script>alert(1)</script><img src="/api/media/image-id" onerror="alert(2)">'
		);

		expect(result).toContain('<strong>Ready</strong>');
		expect(result).toContain('<img src="/api/media/image-id" />');
		expect(result).not.toContain('<script>');
		expect(result).not.toContain('onerror');
	});

	it('recognizes image-only posts as content', () => {
		expect(hasRichTextContent('<img src="/api/media/image-id" />')).toBe(true);
		expect(hasRichTextContent('<p> </p>')).toBe(false);
	});
});
