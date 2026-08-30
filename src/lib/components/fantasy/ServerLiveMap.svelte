<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';
	import type { Map as LeafletMap, TileLayer } from 'leaflet';
	import type { ServerStatusResult } from '$lib/server/server-status/types';

	let { title = 'Live world chart', immersive = false }: { title?: string; immersive?: boolean } =
		$props();

	let mapElement: HTMLDivElement;
	let mapImageUrl = $state<string | null>(null);
	let worldName = $state('Yggdrasil');
	let mapReady = $state(false);

	onMount(() => {
		let active = true;
		let map: LeafletMap | null = null;
		let tileLayer: TileLayer | null = null;
		let tileUrl: string | null = null;
		let resizeObserver: ResizeObserver | null = null;

		const renderMap = async (result: ServerStatusResult) => {
			if (!result.mapTileUrl) return;
			const leaflet = await import('leaflet');
			if (!active) return;

			const maximumZoom = result.mapMaxZoom ?? 8;
			const worldBounds = leaflet.latLngBounds([
				[-256, 0],
				[0, 256]
			]);

			if (!map) {
				map = leaflet.map(mapElement, {
					attributionControl: false,
					crs: leaflet.CRS.Simple,
					doubleClickZoom: true,
					maxBounds: worldBounds.pad(0.08),
					maxBoundsViscosity: 0.72,
					maxZoom: maximumZoom,
					minZoom: 0,
					scrollWheelZoom: true,
					touchZoom: true,
					zoomControl: false,
					zoomDelta: 0.5,
					zoomSnap: 0.25
				});

				resizeObserver = new ResizeObserver(() => map?.invalidateSize({ animate: false }));
				resizeObserver.observe(mapElement);
			}

			if (tileLayer && tileUrl !== result.mapTileUrl) {
				tileLayer.removeFrom(map);
				tileLayer = null;
				mapReady = false;
			}

			if (!tileLayer) {
				tileUrl = result.mapTileUrl;
				tileLayer = leaflet.tileLayer(tileUrl, {
					bounds: worldBounds,
					className: 'world-map-layer',
					maxNativeZoom: maximumZoom,
					maxZoom: maximumZoom,
					minZoom: 0,
					noWrap: true,
					tileSize: 256
				});
				tileLayer.once('load', () => {
					if (active) mapReady = true;
				});
				tileLayer.addTo(map);
				map.fitBounds(worldBounds, { animate: false, padding: [8, 8] });
			}
		};

		const refresh = async () => {
			try {
				const response = await fetch('/api/servers/featured/status');
				if (!response.ok) return;
				const result = (await response.json()) as ServerStatusResult;
				if (!active) return;
				mapImageUrl = result.mapImageUrl;
				worldName = result.worldName ?? result.name;
				await renderMap(result);
			} catch {
				// Keep the last rendered chart when a refresh fails.
			}
		};

		void refresh();
		const timer = window.setInterval(refresh, 30_000);
		return () => {
			active = false;
			window.clearInterval(timer);
			resizeObserver?.disconnect();
			map?.remove();
		};
	});
</script>

<figure class="live-map" class:immersive aria-labelledby="live-map-title">
	<div class="map-frame">
		{#if mapImageUrl}
			<img
				class="map-fallback"
				class:loaded={mapReady}
				src={mapImageUrl}
				alt=""
				width="2048"
				height="2048"
			/>
		{:else if !mapReady}
			<p role="status">The world chart is unavailable.</p>
		{/if}
		<div
			class="map-canvas"
			class:ready={mapReady}
			bind:this={mapElement}
			role="region"
			aria-label={`Interactive world map of ${worldName}`}
		></div>
	</div>
	<figcaption>
		<strong id="live-map-title">{title}</strong>
		<span>{worldName} · live server tiles</span>
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

	.map-fallback {
		position: absolute;
		inset: 0;
		z-index: 0;
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		transition: opacity 240ms ease;
	}

	.map-fallback.loaded {
		opacity: 0;
	}

	.map-canvas {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: #12223a !important;
		cursor: grab;
		opacity: 0;
	}

	.map-canvas.ready {
		opacity: 1;
	}

	.map-canvas:active {
		cursor: grabbing;
	}

	.map-canvas :global(.leaflet-tile-pane) {
		filter: saturate(0.92) contrast(1.04);
	}

	.map-canvas :global(.leaflet-control-container) {
		display: none;
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
