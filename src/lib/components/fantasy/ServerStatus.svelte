<script lang="ts">
	import { onMount } from 'svelte';
	import type { ServerStatusResult } from '$lib/server/server-status/types';

	let {
		name = "The Wolves' Den",
		online = true,
		players = 4,
		maxPlayers = 10,
		ping = 42,
		playerNames = ['Eirik', 'Freydis', 'Ulf', 'Sigrun']
	}: {
		name?: string;
		online?: boolean;
		players?: number;
		maxPlayers?: number;
		ping?: number;
		playerNames?: string[];
	} = $props();

	let current = $state({
		name: "The Wolves' Den",
		online: true,
		players: 4,
		maxPlayers: 10,
		ping: 42,
		playerNames: ['Eirik', 'Freydis', 'Ulf', 'Sigrun']
	});
	let receivedLiveStatus = $state(false);

	$effect(() => {
		if (!receivedLiveStatus) current = { name, online, players, maxPlayers, ping, playerNames };
	});

	onMount(() => {
		let active = true;
		const refresh = async () => {
			try {
				const response = await fetch('/api/servers/featured/status');
				if (!response.ok) return;
				const result = (await response.json()) as ServerStatusResult;
				if (!active) return;
				receivedLiveStatus = true;
				current = {
					name: result.name,
					online: result.state === 'online',
					players: result.playerCount ?? 0,
					maxPlayers: result.maxPlayers ?? 0,
					ping: result.pingMs ?? 0,
					playerNames: result.playerNames
				};
			} catch {
				// Retain the last known state when a refresh cannot reach the backend.
			}
		};

		void refresh();
		const timer = window.setInterval(refresh, 30_000);
		return () => {
			active = false;
			window.clearInterval(timer);
		};
	});
</script>

<section class="status-card" aria-labelledby="server-name">
	<div class="shield-wrap" aria-hidden="true">
		<img src="/images/ui/server-shield.webp" alt="" width="1024" height="1024" />
		<span class:offline={!current.online}></span>
	</div>

	<div class="status-slab">
		<p class="game">Valheim</p>
		<h2 id="server-name">{current.name}</h2>
		<p class="state" class:offline={!current.online}>
			<span aria-hidden="true"></span>{current.online ? 'Online' : 'Offline'}
		</p>

		<div
			class="population"
			aria-label={`${current.players} of ${current.maxPlayers} players online`}
		>
			<strong>{current.players}</strong>
			<span>/ {current.maxPlayers} wolves</span>
		</div>

		<div class="meter" aria-hidden="true">
			<i style={`width: ${current.maxPlayers ? (current.players / current.maxPlayers) * 100 : 0}%`}
			></i>
		</div>

		{#if current.online && current.playerNames.length}
			<ul aria-label="Online players">
				{#each current.playerNames as player (player)}
					<li><span aria-hidden="true">ᚢ</span>{player}</li>
				{/each}
			</ul>
		{:else if current.online}
			<p class="no-names">Player names unavailable</p>
		{/if}

		<p class="ping">
			<span>Last rune signal</span><strong
				>{current.online ? `${current.ping} ms` : 'No response'}</strong
			>
		</p>
	</div>
</section>

<style>
	.status-card {
		position: relative;
		padding-top: 5.2rem;
		filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.7));
	}

	.shield-wrap {
		position: absolute;
		z-index: 3;
		top: 0;
		left: 50%;
		width: 9.5rem;
		aspect-ratio: 1;
		transform: translateX(-50%);
		filter: drop-shadow(0 0 16px rgba(168, 59, 67, 0.34));
	}

	.shield-wrap img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.shield-wrap span {
		position: absolute;
		right: 1.05rem;
		bottom: 1.4rem;
		width: 0.78rem;
		aspect-ratio: 1;
		border: 2px solid #d9ffea;
		border-radius: 50%;
		background: var(--success-400);
		box-shadow: 0 0 12px var(--success-400);
	}

	.shield-wrap span.offline {
		background: var(--danger-400);
		box-shadow: 0 0 12px var(--danger-400);
	}

	.status-slab {
		padding: 5rem 1.3rem 1.2rem;
		border: 1px solid rgba(137, 115, 69, 0.62);
		background:
			linear-gradient(135deg, rgba(168, 59, 67, 0.1), transparent 30%),
			repeating-linear-gradient(90deg, transparent 0 5px, rgba(255, 255, 255, 0.009) 5px 6px),
			rgba(4, 10, 13, 0.94);
		clip-path: polygon(
			0.75rem 0,
			calc(100% - 0.75rem) 0,
			100% 0.75rem,
			100% calc(100% - 1rem),
			calc(100% - 1rem) 100%,
			1rem 100%,
			0 calc(100% - 1rem),
			0 0.75rem
		);
		box-shadow:
			inset 0 0 24px rgba(168, 59, 67, 0.1),
			var(--shadow-deep);
		text-align: center;
	}

	.game {
		margin: 0;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.18em;
	}

	h2 {
		margin: 0.25rem 0 0.65rem;
		color: var(--frost-100);
		font-size: 1.05rem;
		text-transform: uppercase;
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 0.85rem;
		color: var(--success-400);
		font-family: var(--display);
		font-size: 0.68rem;
		text-transform: uppercase;
	}

	.state span {
		width: 0.45rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: currentColor;
		box-shadow: 0 0 8px currentColor;
	}

	.state.offline {
		color: var(--danger-400);
	}

	.population {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.35rem;
	}

	.population strong {
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 1.75rem;
	}

	.population span {
		color: var(--text-muted);
		font-size: 0.7rem;
	}

	.meter {
		height: 0.28rem;
		margin: 0.35rem 0 1rem;
		border: 1px solid rgba(184, 197, 198, 0.24);
		background: #020506;
	}

	.meter i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #68232d, var(--rune-400));
		box-shadow: 0 0 8px var(--rune-500);
	}

	ul {
		display: grid;
		gap: 0.2rem;
		margin: 0;
		padding: 0;
		list-style: none;
		text-align: left;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.2rem 0.35rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.08);
		font-size: 0.73rem;
	}

	li span {
		color: var(--rune-400);
	}

	.no-names {
		color: var(--text-muted);
		font-size: 0.7rem;
	}

	.ping {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		margin: 0.9rem 0 0;
		padding-top: 0.6rem;
		border-top: 1px solid rgba(137, 115, 69, 0.32);
		color: var(--text-muted);
		font-size: 0.62rem;
	}

	.ping strong {
		color: var(--steel-300);
	}

	@media (max-width: 47.99rem) {
		.status-card {
			width: min(100%, 24rem);
			margin-inline: auto;
		}

		.shield-wrap {
			width: 8.5rem;
		}
	}
</style>
