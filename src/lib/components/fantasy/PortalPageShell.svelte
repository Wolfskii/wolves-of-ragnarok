<script lang="ts">
	import type { Snippet } from 'svelte';
	import FantasyFooter from './FantasyFooter.svelte';
	import FantasyNavigation from './FantasyNavigation.svelte';
	import FantasyPanel from './FantasyPanel.svelte';
	import PortalBrand from './PortalBrand.svelte';
	import RealmSystems from './RealmSystems.svelte';
	import ServerStatus from './ServerStatus.svelte';

	let { title, eyebrow, children }: { title: string; eyebrow: string; children: Snippet } =
		$props();
</script>

<div class="site-world interior-world">
	<main class="portal-shell">
		<header>
			<PortalBrand />
			<FantasyNavigation />
		</header>
		<div class="page-layout">
			<aside class="page-sidebar page-sidebar--left" aria-label="Realm systems">
				<RealmSystems />
			</aside>

			<div class="content">
				<FantasyPanel {title} {eyebrow}>
					{@render children()}
				</FantasyPanel>
			</div>

			<aside class="page-sidebar page-sidebar--right" aria-label="Realm status">
				<ServerStatus />
			</aside>
		</div>
	</main>
	<FantasyFooter />
</div>

<style>
	.interior-world {
		min-height: 100vh;
	}

	.page-layout {
		display: grid;
		grid-template-columns: minmax(12rem, 0.72fr) minmax(0, 2fr) minmax(12rem, 0.8fr);
		gap: 1.25rem;
		align-items: start;
		width: min(100%, var(--portal-width));
		margin: 5rem auto 2rem;
	}

	.content,
	.page-sidebar {
		min-width: 0;
	}

	.page-sidebar {
		display: grid;
		gap: 1.5rem;
	}

	@media (max-width: 64rem) {
		.page-layout {
			grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 1.8fr);
		}
		.page-sidebar--right {
			grid-column: 1 / -1;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 36rem) {
		.page-layout {
			grid-template-columns: 1fr;
			margin-top: 2rem;
		}
		.page-sidebar--left {
			grid-row: 2;
		}
		.page-sidebar--right {
			grid-column: auto;
			grid-template-columns: 1fr;
			grid-row: 3;
		}
	}
</style>
