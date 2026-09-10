<script lang="ts">
	import { onMount } from 'svelte';
	import type { ServerStatusResult } from '$lib/server/server-status/types';

	let { title = 'Live world chart', immersive = false }: { title?: string; immersive?: boolean } =
		$props();

	let mapUrl = $state<string | null>(null);
	let worldName = $state('Yggdrasil');

	onMount(() => {
		let active = true;
		let retryTimer: number | undefined;
		let retryIndex = 0;
		const retryDelays = [500, 1000, 2000, 5000];

		const scheduleRetry = () => {
			if (!active || retryTimer || retryIndex >= retryDelays.length) return;
			const delay = retryDelays[retryIndex++];
			retryTimer = window.setTimeout(() => {
				retryTimer = undefined;
				void refresh();
			}, delay);
		};

		const refresh = async () => {
			try {
				const response = await fetch('/api/servers/featured/status');
				if (!response.ok) {
					scheduleRetry();
					return;
				}
				const result = (await response.json()) as ServerStatusResult;
				if (!active) return;
				if (!result.mapUrl) {
					scheduleRetry();
					return;
				}
				retryIndex = 0;
				mapUrl = result.mapUrl;
				worldName = result.worldName ?? result.name;
			} catch {
				// Keep the last rendered chart when a refresh fails.
				scheduleRetry();
			}
		};

		void refresh();
		const timer = window.setInterval(refresh, 30_000);
		return () => {
			active = false;
			window.clearInterval(timer);
			if (retryTimer) window.clearTimeout(retryTimer);
		};
	});
</script>

<figure class="live-map" class:immersive aria-labelledby="live-map-title">
	<div class="map-frame">
		{#if mapUrl}
			<iframe class="public-map" src={mapUrl} title={`Public Valheim map of ${worldName}`}></iframe>
		{:else}
			<p role="status">The world chart is unavailable.</p>
		{/if}
	</div>
	<figcaption>
		<strong id="live-map-title">{title}</strong>
		<span>{worldName} · public fog map</span>
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

	.immersive .map-frame {
		aspect-ratio: 16 / 7;
		min-height: 28rem;
	}

	.map-frame::after {
		content: '';
		position: absolute;
		inset: 0;
		border: 5px solid rgba(5, 10, 13, 0.64);
		box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.42);
		pointer-events: none;
	}

	.public-map {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		background: #12223a;
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

	.immersive figcaption {
		display: none;
	}

	@media (max-width: 35rem) {
		.immersive .map-frame {
			aspect-ratio: 4 / 5;
			min-height: 30rem;
		}

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
