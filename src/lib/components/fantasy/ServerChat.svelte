<script lang="ts">
	import { onMount } from 'svelte';
	import { Send } from '@lucide/svelte';
	import { loadAdventurerName } from '$lib/client/adventurer-name';
	import { formatDayMonthClock } from '$lib/client/format-stamp';

	type ChatMessage = {
		sequence: number;
		playerName: string;
		text: string;
		shout: boolean;
		unixMs: number;
	};

	const playerInks = [
		'#1d4ed8',
		'#b42318',
		'#0f766e',
		'#7c3aed',
		'#9a3412',
		'#0369a1',
		'#166534',
		'#9f1239',
		'#a16207',
		'#4338ca'
	];

	let chats = $state<ChatMessage[]>([]);
	let cursor = $state<number | null>(null);
	let name = $state('');
	let message = $state('');
	let loading = $state(false);
	let sending = $state(false);
	let error = $state('');
	let chatLog = $state<HTMLOListElement | undefined>(undefined);

	function playerInk(playerName: string): string {
		const displayName = playerName.trim();
		if (!displayName || displayName === 'Server') return '#9f1239';
		let hash = 0;
		for (const char of displayName) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
		return playerInks[hash % playerInks.length];
	}

	function speaker(playerName: string): string {
		return playerName.trim() || 'Server';
	}

	function chatKey(chat: ChatMessage): string {
		return `${chat.unixMs}|${chat.playerName}|${chat.text}|${chat.shout ? 1 : 0}|${chat.sequence}`;
	}

	async function refresh() {
		if (loading) return;
		loading = true;
		try {
			const query = cursor === null ? '' : `?cursor=${encodeURIComponent(String(cursor))}`;
			const response = await fetch(`/api/servers/featured/activity${query}`);
			if (!response.ok) throw new Error('ACTIVITY_UNAVAILABLE');
			const result = (await response.json()) as {
				cursor: number;
				chats: ChatMessage[];
			};
			cursor = result.cursor;
			chats = [...result.chats].sort(
				(left, right) => left.unixMs - right.unixMs || left.sequence - right.sequence
			);
			error = '';
		} catch {
			error = 'Server chat is unavailable right now.';
		} finally {
			loading = false;
		}
	}

	async function sendChat(event: SubmitEvent) {
		event.preventDefault();
		const displayName = name.trim();
		const text = message.trim();
		if (!displayName || !text || sending) return;
		sending = true;
		error = '';
		try {
			const response = await fetch('/api/servers/featured/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ name: displayName, text })
			});
			if (!response.ok) {
				const result = (await response.json().catch(() => null)) as { error?: string } | null;
				throw new Error(result?.error ?? 'CHAT_UNAVAILABLE');
			}
			message = '';
			await refresh();
		} catch (sendError) {
			error = sendError instanceof Error ? sendError.message : 'Server chat is unavailable.';
		} finally {
			sending = false;
		}
	}

	onMount(() => {
		name = loadAdventurerName();
		void refresh();
		const timer = window.setInterval(() => void refresh(), 5000);
		return () => window.clearInterval(timer);
	});

	$effect(() => {
		const latest = chats.at(-1);
		if (!chatLog || !latest) return;
		chatLog.scrollTop = chatLog.scrollHeight;
	});
</script>

<article class="chat-scroll" aria-labelledby="server-chat-title">
	<div class="scroll-roll" aria-hidden="true"></div>
	<div class="scroll-skin">
		<p class="eyebrow">The hall speaks</p>
		<h2 id="server-chat-title">Server chat</h2>

		<div class="chat-log" aria-label="Server chat">
			{#if chats.length}
				<ol bind:this={chatLog}>
					{#each chats as chat (chatKey(chat))}
						<li class:shout={chat.shout} class:system={!speaker(chat.playerName).trim()}>
							<time datetime={new Date(chat.unixMs).toISOString()}
								>{formatDayMonthClock(chat.unixMs)}</time
							>
							<p>
								<strong style:color={playerInk(chat.playerName)}>[{speaker(chat.playerName)}]</strong
								><span class:yell={chat.shout} class:said={!chat.shout}>: {chat.text}</span>
							</p>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="empty">{error || 'The scroll is waiting for the first word.'}</p>
			{/if}
		</div>

		<form class="chat-form" onsubmit={sendChat}>
			<p class="chat-speaker">
				Speaking as <strong>{name || 'a nameless wanderer'}</strong>
			</p>
			<label class="sr-only" for="server-chat">Message</label>
			<div class="chat-input-row">
				<input
					id="server-chat"
					bind:value={message}
					maxlength="220"
					placeholder="Speak in the hall"
					autocomplete="off"
				/>
				<button
					type="submit"
					disabled={sending || !name.trim() || !message.trim()}
					aria-label="Send server chat"
					title="Send server chat"
				>
					<Send size={15} aria-hidden="true" />
				</button>
			</div>
		</form>
		{#if error && chats.length}<p class="chat-error" role="alert">{error}</p>{/if}
	</div>
	<div class="scroll-roll scroll-roll--foot" aria-hidden="true"></div>
</article>

<style>
	.chat-scroll {
		position: relative;
		min-width: 0;
		filter: drop-shadow(0 18px 18px rgba(0, 0, 0, 0.55));
	}

	.scroll-roll {
		position: relative;
		z-index: 2;
		height: 1.15rem;
		border: 1px solid #5c3818;
		border-radius: 999px;
		background:
			radial-gradient(circle at 18% 50%, rgba(255, 236, 196, 0.35), transparent 18%),
			linear-gradient(180deg, #8a5a2b 0%, #d7b36e 38%, #6b4424 72%, #3f2612 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 236, 196, 0.45),
			0 4px 8px rgba(0, 0, 0, 0.35);
	}

	.scroll-roll--foot {
		background:
			radial-gradient(circle at 82% 50%, rgba(255, 236, 196, 0.3), transparent 18%),
			linear-gradient(180deg, #6b4424 0%, #d7b36e 42%, #5c3818 78%, #3f2612 100%);
	}

	.scroll-skin {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 0.65rem;
		margin: -0.28rem 0.42rem;
		padding: 0.95rem 0.8rem 1rem;
		border-inline: 1px solid #8a6232;
		background:
			radial-gradient(ellipse at 18% 8%, rgba(255, 248, 230, 0.55), transparent 42%),
			radial-gradient(ellipse at 88% 92%, rgba(122, 74, 28, 0.16), transparent 46%),
			repeating-linear-gradient(0deg, rgba(92, 54, 18, 0.05) 0 2px, transparent 2px 8px),
			linear-gradient(180deg, #f4e4bc 0%, #e6cb90 52%, #d4b06a 100%);
		box-shadow:
			inset 0 16px 18px rgba(90, 48, 12, 0.08),
			inset 0 -18px 22px rgba(74, 40, 8, 0.14),
			inset 12px 0 18px rgba(92, 54, 18, 0.1),
			inset -12px 0 18px rgba(92, 54, 18, 0.1);
	}

	.scroll-skin::before,
	.scroll-skin::after {
		content: '';
		position: absolute;
		inset-block: 0.45rem;
		width: 0.55rem;
		background: repeating-linear-gradient(
			180deg,
			rgba(92, 54, 18, 0.22) 0 3px,
			transparent 3px 9px
		);
		pointer-events: none;
	}

	.scroll-skin::before {
		left: 0.2rem;
	}

	.scroll-skin::after {
		right: 0.2rem;
	}

	.eyebrow {
		margin: 0;
		color: #8f1119;
		font-family: var(--display);
		font-size: 0.58rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h2 {
		margin: 0;
		color: #4a2c12;
		font-family: var(--display);
		font-size: 1.12rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		text-shadow: 0 1px 0 rgba(255, 248, 230, 0.55);
	}

	.chat-log {
		min-width: 0;
	}

	ol {
		display: grid;
		gap: 0.18rem;
		max-height: 14.5rem;
		margin: 0;
		padding: 0.15rem 0.15rem 0.15rem 0;
		overflow: auto;
		list-style: none;
	}

	li {
		display: grid;
		gap: 0.08rem;
	}

	time {
		color: #6b4b27;
		font-family: var(--code);
		font-size: 0.58rem;
		font-variant-numeric: tabular-nums;
	}

	p {
		margin: 0;
		color: #1c1208;
		font-family: var(--code);
		font-size: 0.68rem;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	strong {
		font-weight: 700;
	}

	.said {
		color: #1f1408;
	}

	.yell {
		color: #b42318;
		font-weight: 700;
	}

	li.system p,
	li.system .said {
		color: #9f1239;
	}

	.empty {
		margin: 0.35rem 0.1rem 0.15rem;
		color: #6b4b27;
		font-family: var(--manuscript);
		font-size: 0.82rem;
		font-style: italic;
		line-height: 1.5;
		text-align: center;
	}

	.chat-form {
		display: grid;
		gap: 0.4rem;
		padding-top: 0.35rem;
		border-top: 1px dashed rgba(92, 54, 18, 0.35);
	}

	.chat-speaker {
		color: #6b4b27;
		font-family: var(--manuscript);
		font-size: 0.78rem;
		font-style: italic;
		line-height: 1.4;
	}

	.chat-speaker strong {
		color: #4a2c12;
		font-family: var(--code);
		font-size: 0.68rem;
		font-style: normal;
	}

	.chat-form input {
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		padding: 0.5rem 0.6rem;
		border: 1px solid #8a6232;
		background: rgba(255, 248, 230, 0.62);
		color: #1c1208;
		font-family: var(--code);
		font-size: 0.72rem;
		box-shadow: inset 0 1px 3px rgba(74, 40, 8, 0.18);
	}

	.chat-form input::placeholder {
		color: #8a6a42;
	}

	.chat-input-row {
		display: flex;
		gap: 0.4rem;
	}

	.chat-input-row input {
		flex: 1;
	}

	.chat-input-row button {
		display: grid;
		place-items: center;
		width: 2.3rem;
		border: 1px solid #5c3818;
		background: linear-gradient(180deg, #8f1119, #49070c);
		color: #f3e2b8;
		cursor: pointer;
	}

	.chat-input-row button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}

	.chat-error {
		margin: 0;
		color: #8f1119;
		font-family: var(--manuscript);
		font-size: 0.75rem;
	}
</style>
