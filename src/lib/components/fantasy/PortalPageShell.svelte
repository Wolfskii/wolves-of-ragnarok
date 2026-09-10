<script lang="ts">
	import type { Snippet } from 'svelte';
	import { resolve } from '$app/paths';
	import { Shield, Swords, UsersRound, ArrowRight } from '@lucide/svelte';
	import FantasyFooter from './FantasyFooter.svelte';
	import FantasyNavigation from './FantasyNavigation.svelte';
	import FantasyPanel from './FantasyPanel.svelte';
	import ServerStatus from './ServerStatus.svelte';

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
		<div class="page-layout">
			<aside class="page-sidebar page-sidebar--left" aria-label="Community links">
				<FantasyPanel title="Join Discord" eyebrow="The community hall">
					<p class="sidebar-copy">
						Find players, plan sessions, share builds, and keep up with the Wolves between games.
					</p>
					<a
						class="discord-link"
						href="https://discord.gg/CbjgD7WVfp"
						target="_blank"
						rel="noreferrer">Join Discord <ArrowRight size={14} /></a
					>
				</FantasyPanel>
				<FantasyPanel title="The Pack Gathers" eyebrow="Choose your road">
					<ul class="path-list">
						<li><span>01</span><a href={resolve('/servers')}>Yggdrasil server</a></li>
						<li><span>02</span><a href={resolve('/members')}>Guild roster</a></li>
						<li><span>03</span><a href={resolve('/rules')}>Community rules</a></li>
					</ul>
				</FantasyPanel>
			</aside>

			<div class="content">
				<FantasyPanel {title} {eyebrow}>
					{@render children()}
				</FantasyPanel>
			</div>

			<aside class="page-sidebar page-sidebar--right" aria-label="Realm status and links">
				<ServerStatus />
				<FantasyPanel title="Survival Systems" eyebrow="The realm is still breathing">
					<nav class="system-links" aria-label="Realm systems">
						<a href={resolve('/survive')}
							><Swords size={16} /><span>Survive<small>Prepare for the road</small></span></a
						>
						<a href={resolve('/wiki')}
							><UsersRound size={16} /><span>Realm Wiki<small>Search Valheim knowledge</small></span
							></a
						>
						<a href={resolve('/rules')}
							><Shield size={16} /><span>Rules<small>Keep the hall welcoming</small></span></a
						>
					</nav>
				</FantasyPanel>
			</aside>
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

	.sidebar-copy {
		margin: 0 0 1rem;
		color: var(--text-muted);
		font-size: 0.72rem;
		line-height: 1.7;
	}

	.discord-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.65rem 0.8rem;
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.62rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	.path-list,
	.system-links {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.path-list li {
		display: grid;
		grid-template-columns: 1.8rem 1fr;
		gap: 0.5rem;
		padding: 0.55rem 0;
		border-bottom: 1px solid rgba(184, 197, 198, 0.1);
	}
	.path-list li span {
		color: var(--rune-300);
		font-family: var(--code);
		font-size: 0.58rem;
	}
	.path-list a {
		color: var(--text);
		font-family: var(--ui);
		font-size: 0.68rem;
		text-decoration: none;
		text-transform: uppercase;
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
