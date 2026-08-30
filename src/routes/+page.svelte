<script lang="ts">
	import FantasyFooter from '$lib/components/fantasy/FantasyFooter.svelte';
	import FantasyNavigation from '$lib/components/fantasy/FantasyNavigation.svelte';
	import FantasyPanel from '$lib/components/fantasy/FantasyPanel.svelte';
	import LoginPanel from '$lib/components/fantasy/LoginPanel.svelte';
	import NewsCard from '$lib/components/fantasy/NewsCard.svelte';
	import ServerLiveMap from '$lib/components/fantasy/ServerLiveMap.svelte';
	import ServerStatus from '$lib/components/fantasy/ServerStatus.svelte';
	import UserPanel from '$lib/components/fantasy/UserPanel.svelte';
	import { resolve } from '$app/paths';
	import { ArrowRight, Shield, Swords, UsersRound } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const fallbackNews = [
		{
			title: 'The Longhouse Doors Open',
			excerpt: 'Our hall is ready for new adventures.',
			date: '29 August 2026',
			author: 'Jarl Wolfskii',
			tone: 'frost' as const
		},
		{
			title: 'Ashlands Expedition Muster',
			excerpt: 'Prepare for the next expedition beyond the boiling sea.',
			date: '27 August 2026',
			author: 'Freydis',
			tone: 'ember' as const
		},
		{
			title: 'New Members Enter the Hall',
			excerpt: 'Welcome to the newest members of the guild.',
			date: '24 August 2026',
			author: 'Skald Eirik',
			tone: 'frost' as const
		}
	];
	let news = $derived(
		data.news.length
			? data.news.map((article, index) => ({
					...article,
					excerpt: article.excerpt ?? 'Read the latest news from the hall.',
					date: article.publishedAt?.toLocaleDateString() ?? 'Recently',
					author: article.author.username,
					tone: index % 2 ? ('ember' as const) : ('frost' as const)
				}))
			: fallbackNews
	);
</script>

<svelte:head>
	<title>Wolves of Ragnarok | Norse Gaming Community</title>
	<meta
		name="description"
		content="Wolves of Ragnarok is a Norse gaming community where adventurers gather, forge alliances, and face the end of worlds together."
	/>
</svelte:head>

<div class="site-world">
	<main>
		<div class="portal-shell">
			<header class="brand-lockup">
				<img
					class="brand-mark"
					src="/images/branding/logo-wolf-light.png"
					alt="Wolves of Ragnarok wolf crest"
					width="576"
					height="642"
				/>
				<h1 class="brand-title">Wolves of Ragnarok</h1>
				<p class="brand-tagline">Where Vikings Gather, Ragnarok Begins.</p>
			</header>

			<FantasyNavigation />

			<div class="portal-crown" aria-hidden="true">
				<span>ᛏ</span><i></i><b>ᛟ</b><i></i><span>ᛉ</span>
			</div>

			<img
				class="world-art world-art--wolf"
				src="/images/creatures/wolf-foreground-left.webp"
				alt=""
				width="1024"
				height="1024"
				aria-hidden="true"
			/>
			<img
				class="world-art world-art--warrior"
				src="/images/characters/viking-warrior-right.webp"
				alt=""
				width="1024"
				height="1536"
				aria-hidden="true"
			/>

			<div class="portal-grid">
				<aside
					class="portal-sidebar portal-sidebar--left"
					aria-label="Member access and announcements"
				>
					{#if data.user}
						<UserPanel user={data.user} />
					{:else}
						<LoginPanel error={form?.loginError} identifier={form?.identifier} />
					{/if}
					<FantasyPanel title="War Council" eyebrow="From the longhouse">
						<ul class="brief-list">
							<li><span>Fri</span><a href={resolve('/community')}>Ashlands raid muster</a></li>
							<li><span>Sat</span><a href={resolve('/community')}>Build night at the Den</a></li>
							<li><span>Sun</span><a href={resolve('/community')}>Community feast</a></li>
						</ul>
					</FantasyPanel>
				</aside>

				<div class="portal-main">
					<FantasyPanel class="welcome-panel" eyebrow="A summons from the North">
						<div class="welcome">
							<p class="section-kicker">The old hall awakens</p>
							<h2 class="section-heading">Stand with the fellowship</h2>
							<p>
								We are a fellowship of builders, raiders, wanderers, and storytellers. Our fires
								burn across Valheim and every world where good company matters more than glory.
							</p>
							<div class="welcome-actions">
								<a class="primary-action" href={resolve('/register')}
									>Answer the call <ArrowRight size={16} /></a
								>
								<a class="secondary-action" href={resolve('/about')}>Read our saga</a>
							</div>
						</div>
					</FantasyPanel>

					<FantasyPanel title="Latest Chronicles" eyebrow="Carved into memory">
						<div class="news-list">
							{#each news as article (article.title)}
								<NewsCard {...article} />
							{/each}
						</div>
					</FantasyPanel>
				</div>

				<aside
					class="portal-sidebar portal-sidebar--right"
					aria-label="Server status and guild links"
				>
					<ServerStatus />
					<FantasyPanel title="Paths from the Hall" eyebrow="Choose your road">
						<nav class="path-list" aria-label="Community links">
							<a href={resolve('/members')}
								><UsersRound size={17} /><span>Guild roster<small>Meet the members</small></span></a
							>
							<a href={resolve('/servers')}
								><Swords size={17} /><span>Game servers<small>Find the battle</small></span></a
							>
							<a href={resolve('/rules')}
								><Shield size={17} /><span>Oath and law<small>Read the rules</small></span></a
							>
						</nav>
					</FantasyPanel>
				</aside>
			</div>
		</div>

		<section class="serpent-band" aria-labelledby="world-map-heading">
			<div class="map-heading">
				<p class="section-kicker">The realm beneath our banner</p>
				<h2 id="world-map-heading">Map of Yggdrasil</h2>
			</div>
			<div class="serpent-map">
				<ServerLiveMap immersive title="Live world chart" />
			</div>
			<img
				class="serpent"
				src="/images/creatures/world-serpent.webp"
				alt=""
				width="1536"
				height="1024"
				loading="lazy"
				aria-hidden="true"
			/>
			<img
				class="shieldmaiden"
				src="/images/characters/shieldmaiden-left.webp"
				alt=""
				width="1024"
				height="1536"
				loading="lazy"
				aria-hidden="true"
			/>
		</section>
	</main>

	<FantasyFooter />
</div>

<style>
	.portal-crown {
		position: absolute;
		z-index: 5;
		top: 18.2rem;
		left: 50%;
		display: grid;
		grid-template-columns: auto minmax(3rem, 12rem) auto minmax(3rem, 12rem) auto;
		align-items: center;
		gap: 0.75rem;
		width: min(78%, 38rem);
		color: var(--brass-400);
		font-family: var(--display);
		transform: translateX(-50%);
	}

	.portal-crown i {
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			var(--steel-500),
			var(--brass-400),
			transparent
		);
	}

	.portal-crown b {
		display: grid;
		place-items: center;
		width: 3rem;
		aspect-ratio: 1;
		border: 1px solid var(--brass-600);
		background: rgba(5, 10, 12, 0.94);
		box-shadow:
			inset 0 0 12px rgba(168, 59, 67, 0.18),
			var(--glow-rune);
		transform: rotate(45deg);
	}

	.world-art {
		position: absolute;
		z-index: 2;
		height: auto;
		pointer-events: none;
		user-select: none;
	}

	.world-art--wolf {
		top: 29rem;
		left: clamp(-17rem, -14vw, -9rem);
		width: clamp(20rem, 29vw, 30rem);
		filter: drop-shadow(0 20px 30px #000);
	}

	.world-art--warrior {
		top: 25rem;
		right: clamp(-18rem, -13vw, -10rem);
		width: clamp(18rem, 26vw, 27rem);
		filter: drop-shadow(0 20px 30px #000);
	}

	:global(.welcome-panel) {
		margin-bottom: 1.5rem;
	}

	.welcome {
		padding: 0.5rem 0.25rem 0.35rem;
	}

	.welcome > p:not(.section-kicker) {
		color: #bbc9c6;
		font-size: 0.83rem;
	}

	.welcome-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.primary-action,
	.secondary-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 2.6rem;
		padding-inline: 1rem;
		font-family: var(--display);
		font-size: 0.62rem;
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}

	.primary-action {
		border: 1px solid var(--brass-600);
		background: var(--glass-button);
		box-shadow:
			inset 0 1px rgba(255, 255, 255, 0.14),
			var(--glow-rune);
		color: var(--frost-100);
		clip-path: polygon(
			0.5rem 0,
			calc(100% - 0.5rem) 0,
			100% 50%,
			calc(100% - 0.5rem) 100%,
			0.5rem 100%,
			0 50%
		);
	}

	.secondary-action {
		color: var(--steel-300);
	}

	.brief-list {
		display: grid;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.brief-list li {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.55rem;
		align-items: start;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.09);
		font-size: 0.66rem;
	}

	.brief-list span {
		color: var(--brass-400);
		font-family: var(--display);
		text-transform: uppercase;
	}

	.brief-list a {
		color: var(--text);
		text-decoration: none;
	}

	.path-list {
		display: grid;
		gap: 0.35rem;
	}

	.path-list a {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr);
		gap: 0.5rem;
		align-items: center;
		padding: 0.55rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.09);
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.62rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	.path-list :global(svg) {
		color: var(--rune-400);
	}

	.path-list small {
		display: block;
		margin-top: 0.05rem;
		color: var(--text-muted);
		font-family: var(--body);
		font-size: 0.52rem;
		text-transform: none;
	}

	.serpent-band {
		position: relative;
		min-height: 50rem;
		margin-top: 1rem;
		overflow: hidden;
		background: linear-gradient(180deg, #030608, transparent 12%, transparent 72%, #030608 100%);
	}

	.serpent-band::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 2;
		background: linear-gradient(
			90deg,
			rgba(2, 5, 7, 0.72),
			transparent 28%,
			transparent 72%,
			rgba(2, 5, 7, 0.74)
		);
		pointer-events: none;
	}

	.serpent {
		position: absolute;
		inset: 0;
		z-index: 3;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 42%;
		mix-blend-mode: screen;
		opacity: 0.16;
		pointer-events: none;
		user-select: none;
	}

	.map-heading {
		position: relative;
		z-index: 5;
		width: min(calc(100% - 3rem), 72rem);
		margin-inline: auto;
		padding-top: 5rem;
		text-align: center;
		pointer-events: none;
	}

	.map-heading h2 {
		margin: 0 0 1.5rem;
		color: var(--frost-100);
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		text-shadow:
			0 4px 18px #000,
			0 0 22px rgba(168, 59, 67, 0.28);
	}

	.serpent-map {
		position: relative;
		z-index: 1;
		width: min(calc(100% - 3rem), 72rem);
		margin-inline: auto;
	}

	.shieldmaiden {
		position: absolute;
		z-index: 4;
		left: max(calc(50% - 42rem), -10rem);
		bottom: -7rem;
		width: clamp(18rem, 27vw, 28rem);
		height: auto;
		filter: drop-shadow(0 20px 28px #000);
		pointer-events: none;
		user-select: none;
	}

	@media (max-width: 75rem) {
		.world-art {
			opacity: 0.54;
		}

		.world-art--wolf {
			left: -13rem;
		}

		.world-art--warrior {
			right: -13rem;
		}
	}

	@media (max-width: 64rem) {
		.portal-crown {
			top: 17rem;
		}

		.world-art--warrior {
			display: none;
		}

		.world-art--wolf {
			top: 33rem;
			left: -9rem;
		}
	}

	@media (max-width: 47.99rem) {
		.portal-crown {
			top: 14.25rem;
			width: 70%;
		}

		.world-art {
			display: none;
		}

		.serpent-band {
			min-height: 46rem;
		}

		.serpent {
			object-position: 49% center;
			opacity: 0.12;
		}

		.map-heading {
			padding-top: 3.5rem;
		}

		.shieldmaiden {
			left: -7rem;
			bottom: -6rem;
			width: 20rem;
			opacity: 0.52;
		}
	}
</style>
