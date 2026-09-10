<script lang="ts">
	import { resolve } from '$app/paths';
	import { Shield, UsersRound } from '@lucide/svelte';
	import FantasyPanel from './FantasyPanel.svelte';
</script>

<FantasyPanel title="Survival Systems" eyebrow="The realm is still breathing">
	<nav class="system-links" aria-label="Realm systems">
		<a href={resolve('/wiki')}>
			<UsersRound size={16} />
			<span>Realm Wiki<small>Search Valheim knowledge</small></span>
		</a>
		<a href={resolve('/rules')}>
			<Shield size={16} />
			<span>Rules<small>Keep the hall welcoming</small></span>
		</a>
	</nav>
</FantasyPanel>

<style>
	.system-links {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.system-links a {
		display: grid;
		grid-template-columns: 1.4rem 1fr;
		gap: 0.5rem;
		align-items: center;
		padding: 0.55rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.1);
		color: var(--steel-300);
		text-decoration: none;
	}

	.system-links :global(svg) {
		color: var(--rune-300);
	}

	.system-links span {
		font-family: var(--ui);
		font-size: 0.68rem;
		text-transform: uppercase;
	}

	.system-links small {
		display: block;
		margin-top: 0.1rem;
		color: var(--text-muted);
		font-family: var(--body);
		font-size: 0.58rem;
		text-transform: none;
	}
</style>
