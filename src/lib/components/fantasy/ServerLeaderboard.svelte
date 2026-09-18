<script lang="ts">
	import { onMount } from 'svelte';
	import FantasyPanel from './FantasyPanel.svelte';

	type LeaderboardPlayer = {
		name: string;
		playSeconds: number;
		deaths: number;
		distanceMeters: number;
		online: boolean;
	};

	let players = $state<LeaderboardPlayer[]>([]);
	let loading = $state(false);
	let error = $state('');

	function formatPlaytime(seconds: number): string {
		const totalMinutes = Math.max(0, Math.floor(seconds / 60));
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
	}

	function formatDistance(meters: number): string {
		return `${(meters / 1000).toFixed(1)} km`;
	}

	async function refresh() {
		if (loading) return;
		loading = true;
		try {
			const response = await fetch('/api/servers/featured/leaderboard');
			if (!response.ok) throw new Error('LEADERBOARD_UNAVAILABLE');
			const result = (await response.json()) as { players?: LeaderboardPlayer[] };
			players = Array.isArray(result.players) ? result.players : [];
			error = '';
		} catch {
			error = 'The sagas are unread right now.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void refresh();
		const timer = window.setInterval(() => void refresh(), 15000);
		return () => window.clearInterval(timer);
	});
</script>

<FantasyPanel title="Leaderboard" eyebrow="This wipe">
	<section class="sidebar-leaderboard" aria-live="polite">
		{#if players.length}
			<div class="board">
				<div class="head" aria-hidden="true">
					<span>#</span>
					<span>Viking</span>
					<span>Time</span>
					<span>Deaths</span>
					<span>Dist</span>
				</div>
				<ol aria-label="Wipe leaderboard">
					{#each players as player, index (player.name)}
						<li class:online={player.online} class:podium={index < 3}>
							<span class="rank">{index + 1}</span>
							<span class="name" title={player.name}>{player.name}</span>
							<span class="stat">{formatPlaytime(player.playSeconds)}</span>
							<span class="stat">{player.deaths}</span>
							<span class="stat">{formatDistance(player.distanceMeters)}</span>
						</li>
					{/each}
				</ol>
			</div>
		{:else}
			<p class="empty">{error || (loading ? 'Reading the runes…' : 'No sagas recorded this wipe.')}</p>
		{/if}
	</section>
</FantasyPanel>

<style>
	.sidebar-leaderboard {
		min-width: 0;
	}

	.board {
		min-width: 0;
	}

	.head,
	li {
		display: grid;
		grid-template-columns: 1.15rem minmax(0, 1fr) 2.55rem 2.1rem 2.55rem;
		gap: 0.28rem;
		align-items: center;
	}

	.head {
		padding: 0 0 0.35rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
		color: var(--brass-400);
		font-size: 0.52rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.head span:nth-child(n + 3) {
		text-align: right;
	}

	ol {
		max-height: 22rem;
		margin: 0;
		padding: 0.15rem 0 0;
		overflow: auto;
		list-style: none;
	}

	li {
		min-height: 1.55rem;
		padding: 0.22rem 0;
		border-bottom: 1px solid rgba(184, 197, 198, 0.08);
		color: var(--frost-200);
		font-size: 0.64rem;
		font-variant-numeric: tabular-nums;
		line-height: 1.25;
	}

	.rank {
		color: var(--brass-400);
		font-family: var(--display);
		font-weight: 700;
	}

	li.podium:nth-child(1) .rank {
		color: #f0c14b;
	}

	li.podium:nth-child(2) .rank {
		color: #c9d4d8;
	}

	li.podium:nth-child(3) .rank {
		color: #c58f57;
	}

	.name {
		min-width: 0;
		overflow: hidden;
		font-weight: 700;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	li.online .name {
		color: #6fe3a2;
	}

	.stat {
		color: var(--text-muted);
		text-align: right;
		white-space: nowrap;
	}

	.empty {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.68rem;
		line-height: 1.6;
	}
</style>
