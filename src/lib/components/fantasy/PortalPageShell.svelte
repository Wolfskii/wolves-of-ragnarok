<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import FantasyFooter from './FantasyFooter.svelte';
	import FantasyNavigation from './FantasyNavigation.svelte';
	import FantasyPanel from './FantasyPanel.svelte';

	let { title, eyebrow, children }: { title: string; eyebrow: string; children: Snippet } =
		$props();
</script>

<div class="site-world interior-world">
	<main class="portal-shell">
		<header>
			<a class="portal-brand" href={resolve('/')}>
				<img src="/images/branding/logo-wolf-light.png" alt="" width="576" height="642" />
				<h1><span>Wolves of</span><strong>Ragnarok</strong></h1>
			</a>
			<FantasyNavigation />
		</header>
		<div class="content">
			<FantasyPanel {title} {eyebrow}>
				{@render children()}
			</FantasyPanel>
		</div>
	</main>
	<FantasyFooter />
</div>

<style>
	.interior-world {
		min-height: 100vh;
	}

	header {
		padding-top: 1rem;
	}

	.portal-brand {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 15rem;
		margin-bottom: 1rem;
		color: var(--frost-100);
		text-decoration: none;
		text-shadow: 0 3px 15px #000;
	}

	.portal-brand img {
		width: clamp(5.5rem, 8vw, 8rem);
		aspect-ratio: 576 / 642;
		height: auto;
		object-fit: contain;
	}

	.portal-brand h1 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 4.25rem);
		line-height: 0.95;
		text-align: left;
		text-transform: uppercase;
	}

	.portal-brand h1 span,
	.portal-brand h1 strong {
		display: block;
	}

	.portal-brand h1 strong {
		color: var(--rune-300);
		font-weight: 400;
	}

	.content {
		width: min(100%, 54rem);
		margin: 5rem auto 2rem;
	}

	@media (max-width: 36rem) {
		.portal-brand {
			flex-direction: column;
			gap: 0.25rem;
			min-height: 10rem;
		}

		.portal-brand h1 {
			text-align: center;
		}
	}
</style>
