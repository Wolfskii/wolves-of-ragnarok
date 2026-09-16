import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import {
	sendValheimChat,
	ValheimOneControlError
} from '$lib/server/server-status/valheimone-control';

const chatSchema = z.object({ text: z.string().trim().min(1).max(220) });

export const POST: RequestHandler = async ({ locals, request, setHeaders }) => {
	setHeaders({
		'cache-control': 'private, no-store',
		vary: 'Cookie'
	});

	if (!locals.user) return json({ error: 'Authentication required.' }, { status: 401 });

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'A message is required.' }, { status: 400 });
	}

	const parsed = chatSchema.safeParse(body);
	if (!parsed.success)
		return json({ error: 'Messages must contain 1 to 220 characters.' }, { status: 400 });

	const operatorName = locals.user.username.slice(0, 64);
	const text = `[${operatorName}] ${parsed.data.text}`;
	if (text.length > 256) return json({ error: 'That message is too long.' }, { status: 400 });

	try {
		await sendValheimChat(text, operatorName);
		return json({ ok: true });
	} catch (error) {
		const status = error instanceof ValheimOneControlError && error.status === 429 ? 429 : 503;
		return json(
			{
				error:
					status === 429
						? 'The server is rate limiting chat.'
						: 'Server chat is temporarily unavailable.'
			},
			{ status }
		);
	}
};
