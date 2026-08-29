<script lang="ts">
	import '$lib/styles/app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/images/branding/logo-wolf-light.png" />
	<meta name="theme-color" content="#05090b" />
</svelte:head>

{@render children()}
