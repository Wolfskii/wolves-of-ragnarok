<script lang="ts">
	import { onMount } from 'svelte';
	import { Activity, MessageCircle, Send } from '@lucide/svelte';

	type ActivityEvent = {
		id: number;
		unixMs: number;
		type: string;
		data: Record<string, unknown>;
	};

	type ChatMessage = {
		sequence: number;
		playerName: string;
		text: string;
		shout: boolean;
		unixMs: number;
	};

	let { user }: { user: { username: string } | null } = $props();
	let events = $state<ActivityEvent[]>([]);
	let chats = $state<ChatMessage[]>([]);
	let cursor = $state<number | null>(null);
	let message = $state('');
	let loading = $state(false);
	let sending = $state(false);
	let error = $state('');

	function stringValue(value: unknown, fallback: string): string {
		return typeof value === 'string' && value.trim() ? value : fallback;
	}

	function eventLabel(event: ActivityEvent): string {
		const name = stringValue(event.data.name, 'A player');
		switch (event.type) {
			case 'player.join':
				return `${name} joined the server`;
			case 'player.leave':
				return `${name} left the server`;
			case 'player.death':
				return `${name} died`;
			case 'raid.start':
				return `${name} began`;
			case 'raid.end':
				return `${name} ended`;
			case 'day.change':
				return `Day ${typeof event.data.day === 'number' ? event.data.day : '?'}`;
			case 'world.save':
				return 'World saved';
			case 'server.start':
				return 'Server started';
			case 'server.stop':
				return 'Server stopped';
			default:
				return event.type.replace('.', ' ');
		}
	}

	function eventClass(type: string): string {
		if (type === 'player.join' || type === 'server.start') return 'positive';
		if (type === 'player.leave' || type === 'server.stop') return 'muted';
		return '';
	}

	function formatTime(unixMs: number): string {
		return new Date(unixMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	async function refresh() {
		if (!user || loading) return;
		loading = true;
		try {
			const query = cursor === null ? '' : `?cursor=${encodeURIComponent(String(cursor))}`;
			const response = await fetch(`/api/servers/featured/activity${query}`);
			if (!response.ok) throw new Error('ACTIVITY_UNAVAILABLE');
			const result = (await response.json()) as {
				cursor: number;
				events: ActivityEvent[];
				chats: ChatMessage[];
			};
			if (cursor === null) events = result.events;
			else if (result.events.length) events = [...events, ...result.events].slice(-100);
			cursor = result.cursor;
			chats = result.chats;
			error = '';
		} catch {
			error = 'The server chronicle is unavailable right now.';
		} finally {
			loading = false;
		}
	}

	async function sendChat(event: SubmitEvent) {
		event.preventDefault();
		const text = message.trim();
		if (!text || sending || !user) return;
		sending = true;
		error = '';
		try {
			const response = await fetch('/api/servers/featured/chat', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ text })
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
		if (!user) return;
		void refresh();
		const timer = window.setInterval(() => void refresh(), 5000);
		return () => window.clearInterval(timer);
	});
</script>

<section class="server-activity" aria-labelledby="server-activity-title">
	<header class="activity-heading">
		<div>
			<p class="section-kicker"><Activity size={14} aria-hidden="true" /> Server chronicle</p>
			<h2 id="server-activity-title">The hall remembers</h2>
		</div>
		{#if user}<span class="live-mark">Live</span>{/if}
	</header>

	{#if !user}
		<p class="activity-gate">
			Sign in to read the server history and speak to players from the site.
		</p>
	{:else}
		<div class="activity-columns">
			<div class="activity-list" aria-live="polite">
				<div class="column-heading">
					<Activity size={15} aria-hidden="true" /><span>Recent events</span>
				</div>
				{#if events.length}
					<ol>
						{#each events as event (event.id)}
							<li class={eventClass(event.type)}>
								<time datetime={new Date(event.unixMs).toISOString()}
									>{formatTime(event.unixMs)}</time
								>
								<span>{eventLabel(event)}</span>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="empty">Waiting for the first recorded event.</p>
				{/if}
			</div>

			<div class="chat-list">
				<div class="column-heading">
					<MessageCircle size={15} aria-hidden="true" /><span>Server chat</span>
				</div>
				{#if chats.length}
					<ol>
						{#each chats as chat (chat.sequence)}
							<li class:shout={chat.shout}>
								<time datetime={new Date(chat.unixMs).toISOString()}>{formatTime(chat.unixMs)}</time
								>
								<div><strong>{chat.playerName || 'Server'}</strong><span>{chat.text}</span></div>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="empty">No recent messages.</p>
				{/if}
			</div>
		</div>

		<form class="chat-form" onsubmit={sendChat}>
			<label for="server-chat">Speak as <strong>{user.username}</strong></label>
			<div class="chat-input-row">
				<input
					id="server-chat"
					bind:value={message}
					maxlength="220"
					placeholder="Send a server shout"
					autocomplete="off"
				/>
				<button
					type="submit"
					disabled={sending || !message.trim()}
					aria-label="Send server chat"
					title="Send server chat"
				>
					<Send size={16} aria-hidden="true" />
				</button>
			</div>
		</form>
		{#if error}<p class="activity-error" role="alert">{error}</p>{/if}
	{/if}
</section>

<style>
	.server-activity {
		margin-top: 1.5rem;
		padding: 1.15rem;
		border: 1px solid rgba(137, 115, 69, 0.55);
		background: rgba(4, 10, 13, 0.74);
		box-shadow: inset 0 0 24px rgba(111, 133, 140, 0.06);
	}
	.activity-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid rgba(197, 174, 112, 0.2);
	}
	.section-kicker,
	.column-heading {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	h2 {
		margin: 0.35rem 0 0;
		color: var(--frost-100);
		font-size: 1.25rem;
		text-transform: uppercase;
	}
	.live-mark {
		color: var(--success-400);
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.activity-gate,
	.empty,
	.activity-error {
		margin: 1rem 0 0;
		color: var(--text-muted);
		font-size: 0.78rem;
		line-height: 1.6;
	}
	.activity-columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
		margin-top: 1rem;
	}
	.activity-list,
	.chat-list {
		min-width: 0;
	}
	.column-heading {
		margin-bottom: 0.55rem;
		color: var(--frost-200);
		font-family: inherit;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
	}
	ol {
		display: grid;
		gap: 0.35rem;
		max-height: 16rem;
		margin: 0;
		padding: 0;
		overflow: auto;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 3.2rem minmax(0, 1fr);
		gap: 0.55rem;
		align-items: baseline;
		padding: 0.38rem 0.45rem;
		border-left: 2px solid rgba(197, 174, 112, 0.18);
		color: var(--text-muted);
		font-size: 0.74rem;
		line-height: 1.4;
	}
	li.positive {
		border-left-color: var(--success-400);
	}
	li.muted {
		border-left-color: rgba(190, 203, 200, 0.28);
	}
	time {
		color: var(--brass-400);
		font-variant-numeric: tabular-nums;
		font-size: 0.64rem;
	}
	.chat-list li {
		grid-template-columns: 3.2rem minmax(0, 1fr);
	}
	.chat-list li div {
		display: grid;
		gap: 0.1rem;
	}
	.chat-list strong {
		color: var(--frost-100);
		font-size: 0.72rem;
	}
	.chat-list span {
		overflow-wrap: anywhere;
	}
	.chat-list li.shout {
		border-left-color: var(--rune-400);
	}
	.chat-form {
		display: grid;
		gap: 0.45rem;
		margin-top: 1rem;
		padding-top: 0.8rem;
		border-top: 1px solid rgba(197, 174, 112, 0.2);
	}
	.chat-form label {
		color: var(--text-muted);
		font-size: 0.7rem;
	}
	.chat-form label strong {
		color: var(--frost-100);
	}
	.chat-input-row {
		display: flex;
		gap: 0.45rem;
	}
	.chat-input-row input {
		min-width: 0;
		flex: 1;
		padding: 0.7rem 0.75rem;
		border: 1px solid rgba(197, 174, 112, 0.32);
		background: rgba(0, 3, 4, 0.72);
		color: var(--frost-100);
		font: inherit;
		font-size: 0.78rem;
	}
	.chat-input-row button {
		display: grid;
		place-items: center;
		width: 2.45rem;
		border: 1px solid rgba(197, 174, 112, 0.52);
		background: var(--rune-700);
		color: var(--frost-100);
		cursor: pointer;
	}
	.chat-input-row button:disabled {
		cursor: not-allowed;
		opacity: 0.45;
	}
	.activity-error {
		color: #f0a6a6;
	}
	@media (max-width: 42rem) {
		.activity-columns {
			grid-template-columns: 1fr;
		}
	}
</style>
