<script lang="ts">
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import ServerStatus from '$lib/components/fantasy/ServerStatus.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.page.title} | Wolves of Ragnarok</title>
	<meta name="description" content={data.page.intro} />
</svelte:head>

<PortalPageShell title={data.page.title} eyebrow={data.page.eyebrow}>
	<p class="intro">{data.page.intro}</p>
	{#if data.page.title === 'Game Servers'}
		<div class="server-status"><ServerStatus /></div>
	{:else}
		<ul>
			{#each data.page.items as item (item)}
				<li><span aria-hidden="true">ᛟ</span>{item}</li>
			{/each}
		</ul>
	{/if}
	<p class="return"><a href={resolve('/')}>Return to the great hall</a></p>
</PortalPageShell>

<style>
	.intro {
		color: #becbc8;
		font-size: 0.88rem;
	}

	.server-status {
		max-width: 24rem;
		margin: 2rem auto;
	}

	ul {
		display: grid;
		gap: 0.6rem;
		margin: 1.5rem 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
		background: rgba(255, 255, 255, 0.015);
	}

	li span {
		color: var(--rune-400);
	}

	.return {
		margin: 1.5rem 0 0;
		font-family: var(--display);
		font-size: 0.65rem;
		text-transform: uppercase;
	}

	.return a {
		color: var(--brass-400);
	}
</style>
