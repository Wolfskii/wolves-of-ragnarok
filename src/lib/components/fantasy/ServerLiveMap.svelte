<script lang="ts">
	import { onMount } from 'svelte';
	import type { ServerStatusResult } from '$lib/server/server-status/types';

	let mapImageUrl = $state<string | null>(null);
	let worldName = $state('Yggdrasil');

	onMount(() => {
		let active = true;
		const refresh = async () => {
			try {
				const response = await fetch('/api/servers/featured/status');
				if (!response.ok) return;
				const result = (await response.json()) as ServerStatusResult;
				if (!active) return;
				mapImageUrl = result.mapImageUrl;
				worldName = result.worldName ?? result.name;
			} catch {
				// Keep the last rendered chart when a refresh fails.
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

<figure class="live-map" aria-labelledby="live-map-title">
	<div class="map-frame">
		{#if mapImageUrl}
			<img src={mapImageUrl} alt={`Live world map of ${worldName}`} width="2048" height="2048" />
		{:else}
			<p role="status">The world chart is unavailable.</p>
		{/if}
	</div>
	<figcaption>
		<strong id="live-map-title">Live world chart</strong>
		<span>{worldName} · refreshed with the server map</span>
	</figcaption>
</figure>

<style>
	.live-map {
		min-width: 0;
		margin: 0;
	}

	.map-frame {
		position: relative;
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		overflow: hidden;
		border: 1px solid rgba(137, 115, 69, 0.72);
		background: #12223a;
		box-shadow:
			inset 0 0 30px rgba(0, 0, 0, 0.5),
			0 16px 30px rgba(0, 0, 0, 0.42);
	}

	.map-frame::after {
		content: '';
		position: absolute;
		inset: 0;
		border: 5px solid rgba(5, 10, 13, 0.64);
		box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.42);
		pointer-events: none;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.map-frame p {
		margin: 0;
		padding: 2rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		text-align: center;
	}

	figcaption {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.65rem 0.15rem 0;
	}

	figcaption strong {
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.68rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	figcaption span {
		color: var(--text-muted);
		font-size: 0.62rem;
		text-align: right;
	}

	@media (max-width: 35rem) {
		figcaption {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.2rem;
		}

		figcaption span {
			text-align: left;
		}
	}
</style>
