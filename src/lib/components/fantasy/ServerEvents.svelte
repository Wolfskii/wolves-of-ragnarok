<script lang="ts">
	import { onMount } from 'svelte';
	import { formatClock, formatDayMonth } from '$lib/client/format-stamp';
	import FantasyPanel from './FantasyPanel.svelte';

	type ActivityEvent = {
		id: number;
		unixMs: number;
		type: string;
		data: Record<string, unknown>;
	};

	const eventLooks: Record<string, { icon: string; tone: string }> = {
		'player.join': { icon: '🟢', tone: 'join' },
		'player.leave': { icon: '🚪', tone: 'leave' },
		'player.death': { icon: '💀', tone: 'death' },
		'raid.start': { icon: '⚔️', tone: 'raid' },
		'raid.end': { icon: '🛡️', tone: 'raid-end' },
		'day.change': { icon: '🌅', tone: 'day' },
		'world.save': { icon: '💾', tone: 'save' },
		'server.start': { icon: '⚡', tone: 'start' },
		'server.stop': { icon: '⛔', tone: 'stop' }
	};

	let events = $state<ActivityEvent[]>([]);
	let cursor = $state<number | null>(null);
	let loading = $state(false);
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

	function eventLook(type: string): { icon: string; tone: string } {
		return eventLooks[type] ?? { icon: '•', tone: 'other' };
	}

	function mergeEvents(incoming: ActivityEvent[]): ActivityEvent[] {
		const byId = new Map(events.map((event) => [event.id, event]));
		for (const event of incoming) byId.set(event.id, event);
		return [...byId.values()]
			.sort((left, right) => right.unixMs - left.unixMs || right.id - left.id)
			.slice(0, 100);
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
				events: ActivityEvent[];
			};
			events = mergeEvents(result.events);
			cursor = result.cursor;
			error = '';
		} catch {
			error = 'The server chronicle is unavailable right now.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void refresh();
		const timer = window.setInterval(() => void refresh(), 5000);
		return () => window.clearInterval(timer);
	});
</script>

<FantasyPanel title="Recent events" eyebrow="Live chronicle">
	<section class="sidebar-events" aria-live="polite">
		{#if events.length}
			<ol>
				{#each events as event (event.id)}
					{@const look = eventLook(event.type)}
					<li class={look.tone}>
						<time datetime={new Date(event.unixMs).toISOString()}>
							<span class="stamp-date">{formatDayMonth(event.unixMs)}</span>
							<span class="stamp-time">{formatClock(event.unixMs)}</span>
						</time>
						<span class="event-body">
							<span class="event-icon" aria-hidden="true">{look.icon}</span>
							<span class="event-text">{eventLabel(event)}</span>
						</span>
					</li>
				{/each}
			</ol>
		{:else}
			<p class="empty">{error || 'Waiting for the first recorded event.'}</p>
		{/if}
	</section>
</FantasyPanel>

<style>
	.sidebar-events {
		min-width: 0;
	}

	ol {
		display: grid;
		gap: 0.18rem;
		max-height: 22rem;
		margin: 0;
		padding: 0;
		overflow: auto;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 2.4rem minmax(0, 1fr);
		gap: 0.4rem;
		align-items: start;
		padding: 0.22rem 0;
		border-bottom: 1px solid rgba(184, 197, 198, 0.08);
		color: var(--text-muted);
		font-size: 0.68rem;
		line-height: 1.35;
	}

	.event-body {
		display: flex;
		gap: 0.32rem;
		min-width: 0;
		align-items: baseline;
	}

	.event-icon {
		flex: none;
		width: 1.1rem;
		font-size: 0.72rem;
		line-height: 1;
		text-align: center;
	}

	.event-text {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	li.join .event-text {
		color: #6fe3a2;
	}

	li.start .event-text {
		color: #9bf0c0;
	}

	li.leave .event-text {
		color: #9aa7b4;
	}

	li.death .event-text {
		color: #ff6b5c;
	}

	li.stop .event-text {
		color: #e85d5d;
	}

	li.raid .event-text {
		color: #ff9a4d;
	}

	li.raid-end .event-text {
		color: var(--brass-400);
	}

	li.day .event-text {
		color: #f0c14b;
	}

	li.save .event-text {
		color: #7f8f86;
	}

	li.other .event-text {
		color: var(--frost-200);
	}

	time {
		display: flex;
		flex-direction: column;
		gap: 0.05rem;
		color: var(--brass-400);
		font-variant-numeric: tabular-nums;
		font-size: 0.58rem;
		line-height: 1.2;
	}

	.stamp-date {
		font-weight: 700;
	}

	.empty {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.68rem;
		line-height: 1.6;
	}
</style>
