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

	.route-layer {
		position: relative;
		min-height: 100vh;
	}
</style>
