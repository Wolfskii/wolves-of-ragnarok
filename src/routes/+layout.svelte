<script lang="ts">
	import '$lib/styles/app.css';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/images/branding/logo-wolf-light.png" />
	<meta name="theme-color" content="#05090b" />
</svelte:head>

<div class="route-stage">
	<div class="atmospheric-snow" aria-hidden="true"></div>
	{#key page.url.pathname}
		<div class="route-layer" in:fade={{ duration: 420 }} out:fade={{ duration: 260 }}>
			{@render children()}
		</div>
	{/key}
</div>

<style>
	.route-stage {
		position: relative;
		min-height: 100vh;
		overflow: clip;
		background: var(--ink-950);
	}

	.atmospheric-snow {
		position: fixed;
		inset: -18vh -18vw;
		z-index: 1;
		pointer-events: none;
		opacity: 0.19;
		background-image:
			repeating-linear-gradient(
				125deg,
				transparent 0 15px,
				rgba(229, 216, 187, 0.34) 15px 16px,
				transparent 16px 34px
			),
			repeating-linear-gradient(
				125deg,
				transparent 0 38px,
				rgba(201, 185, 149, 0.2) 38px 39px,
				transparent 39px 77px
			);
		background-size:
			180px 180px,
			320px 320px;
		mix-blend-mode: screen;
		transform: translate3d(-7%, -7%, 0);
		animation: snow-drift 18s linear infinite;
	}

	.route-layer {
		position: relative;
		z-index: 2;
		min-height: 100vh;
	}

	@keyframes snow-drift {
		from {
			transform: translate3d(-7%, -7%, 0);
		}
		to {
			transform: translate3d(7%, 7%, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.atmospheric-snow {
			animation: none;
		}
	}
</style>
