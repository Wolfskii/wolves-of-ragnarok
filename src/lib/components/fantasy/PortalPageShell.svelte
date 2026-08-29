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
			<a href={resolve('/')}>
				<img src="/images/branding/logo-wolf-light.png" alt="" width="576" height="642" />
				<span>Wolves of Ragnarok</span>
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

	header > a {
		display: grid;
		justify-items: center;
		margin-bottom: 1rem;
		color: var(--frost-100);
		font-family: var(--display);
		font-size: clamp(1.8rem, 5vw, 3.2rem);
		text-decoration: none;
		text-shadow: 0 3px 15px #000;
	}

	header img {
		width: 5.5rem;
		height: auto;
	}

	header span {
		margin-top: -0.9rem;
	}

	.content {
		width: min(100%, 54rem);
		margin: 5rem auto 2rem;
	}
</style>
