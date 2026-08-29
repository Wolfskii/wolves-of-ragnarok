<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import FantasyPanel from './FantasyPanel.svelte';

	let { title, eyebrow, children }: { title: string; eyebrow: string; children: Snippet } =
		$props();
</script>

<div class="site-world auth-world">
	<main>
		<a class="brand" href={resolve('/')}>
			<img src="/images/branding/logo-wolf-light.png" alt="" width="576" height="642" />
			<span>Wolves of Ragnarok</span>
		</a>
		<div class="auth-panel">
			<FantasyPanel {title} {eyebrow}>
				{@render children()}
			</FantasyPanel>
		</div>
	</main>
</div>

<style>
	.auth-world {
		min-height: 100vh;
		padding: 3rem 1rem;
	}

	main {
		width: min(100%, 38rem);
		margin-inline: auto;
	}

	.brand {
		display: grid;
		justify-items: center;
		margin-bottom: 1.5rem;
		color: var(--frost-100);
		font-family: var(--display);
		font-size: clamp(1.5rem, 5vw, 2.25rem);
		text-decoration: none;
		text-shadow: 0 3px 12px #000;
	}

	.brand img {
		width: 5rem;
		height: auto;
	}

	.brand span {
		margin-top: -0.7rem;
	}

	.auth-panel {
		filter: drop-shadow(0 24px 42px #000);
	}
</style>
