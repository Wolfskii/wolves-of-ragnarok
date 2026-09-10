<script lang="ts">
	import FantasyFooter from '$lib/components/fantasy/FantasyFooter.svelte';
	import FantasyNavigation from '$lib/components/fantasy/FantasyNavigation.svelte';
	import FantasyPanel from '$lib/components/fantasy/FantasyPanel.svelte';
	import NewsCard from '$lib/components/fantasy/NewsCard.svelte';
	import RagnarokGate from '$lib/components/fantasy/RagnarokGate.svelte';
	import ServerLiveMap from '$lib/components/fantasy/ServerLiveMap.svelte';
	import ServerStatus from '$lib/components/fantasy/ServerStatus.svelte';
	import { resolve } from '$app/paths';
	import { ArrowRight, Shield, Swords, UsersRound } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const fallbackNews = [
		{
			slug: 'valheim-1-0-has-arrived',
			title: 'Valheim 1.0 Has Arrived',
			excerpt:
				'The Deep North is open. Read what changed and prepare the Wolves for their first expedition.',
			body: 'Iron Gate has released Valheim 1.0 and opened the road into the Deep North.\n\n## New content\n\n- The Deep North biome.\n- 40+ new weapons.\n- New bombs and ammunition.\n- Four new armor sets, two capes, and two trinkets.\n- New tools and 10+ new creatures.\n- 80+ new buildable pieces and five crafting-related build pieces.\n- 30+ new crafting materials and 20+ new food items.\n- New locations, music, events, mechanics, upgradeable pockets, and achievements.\n\n## Fixes and improvements\n\n- New draw-distance graphics setting.\n- Overhauled hammer and serving-tray menus.\n- Magica cloth system and improved descriptions.\n- Rebalanced enemy spawn chances in the Ashlands.\n- All hair and beard styles available from the start.\n- Unity engine upgrade and further fixes.\n\nThe Wolves are taking the pack north together. Bring warmth, supplies, and a willingness to learn the new threats as a group.',
			imageUrl: '/media/valheim/valheim-1-0-deep-north.jpg',
			date: '9 September 2026',
			author: 'Wolves of Ragnarok',
			tone: 'ember' as const
		}
	];
	let news = $derived(
		data.news.length
			? data.news.map((article, index) => ({
					...article,
					excerpt: article.excerpt ?? 'Read the latest news from the hall.',
					date: article.publishedAt?.toLocaleDateString() ?? 'Recently',
					author: article.author.username,
					body: article.body,
					imageUrl: article.coverMedia?.id ? `/api/media/${article.coverMedia.id}` : undefined,
					tone: index % 2 ? ('ember' as const) : ('frost' as const)
				}))
			: fallbackNews
	);
</script>

<svelte:head>
	<title>Wolves of Ragnarok | Valheim Survival Realm</title>
	<meta
		name="description"
		content="Wolves of Ragnarok is an English and Swedish Valheim survival community built for difficult journeys, persistent worlds, and strong alliances."
	/>
</svelte:head>

<RagnarokGate>
	<div class="site-world">
		<main>
			<div class="portal-shell">
				<header class="brand-lockup warheim-brand">
					<h1 class="brand-title"><span>Wolves of</span><strong>Ragnarok</strong></h1>
					<p class="brand-tagline">Good games. Better company.</p>
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
						aria-label="Community access and realm notices"
					>
						<FantasyPanel title="Join the Pack" eyebrow="Discord is the longhouse">
							<p class="aside-copy">
								No forum. No dead halls. Find the next expedition, ask for help, and meet the people
								behind the names in Discord.
							</p>
							<a
								class="discord-action"
								href="https://discord.gg/CbjgD7WVfp"
								target="_blank"
								rel="noreferrer">Join Discord <ArrowRight size={14} /></a
							>
						</FantasyPanel>
						<FantasyPanel title="The Pack Gathers" eyebrow="Choose your road">
							<ul class="brief-list">
								<li>
									<span>01</span><a href={resolve('/servers')}>Enter Yggdrasil</a>
								</li>
								<li>
									<span>02</span><a
										href="https://discord.gg/CbjgD7WVfp"
										target="_blank"
										rel="noreferrer">Join Discord</a
									>
								</li>
								<li><span>03</span><a href={resolve('/rules')}>Learn the oath</a></li>
							</ul>
						</FantasyPanel>
					</aside>

					<div class="portal-main">
						<FantasyPanel class="welcome-panel war-hero-panel">
							<div class="welcome">
								<h2 class="section-heading">Yggdrasil is waiting.</h2>
								<p>
									Yggdrasil is the Wolves of Ragnarok Valheim server, started for the Valheim 1.0
									release and all its new content. It is a persistent world for builders, explorers,
									and groups looking for their next adventure together.
								</p>
								<div class="welcome-actions">
									<a class="primary-action" href={resolve('/servers')}
										>Enter the Yggdrasil Valheim server <ArrowRight size={16} /></a
									>
									<a class="secondary-action" href={resolve('/about')}>Know the realm</a>
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
						<ServerStatus showInfoLink />
						<FantasyPanel title="Survival Systems" eyebrow="The realm is still breathing">
							<nav class="path-list" aria-label="Realm links">
								<a href={resolve('/members')}
									><UsersRound size={17} /><span>Guild roster<small>Meet the members</small></span
									></a
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

			<section class="threat-strip" aria-label="The Wolves of Ragnarok way">
				<div><span>01</span><strong>Survive</strong><small>Preparation is power.</small></div>
				<div><span>02</span><strong>Learn</strong><small>Every death leaves a map.</small></div>
				<div>
					<span>03</span><strong>Conquer</strong><small>No one holds the line alone.</small>
				</div>
			</section>

			<section class="manifesto-section" aria-labelledby="manifesto-heading">
				<div class="manifesto-index">ᛉ · THE FIRST LAW</div>
				<div class="manifesto-copy">
					<p class="section-kicker">A realm for the relentless</p>
					<h2 id="manifesto-heading">
						<span>The brutal road is better</span><strong>with a pack.</strong>
					</h2>
					<p>
						Bosses, raids, weather, distance, and the long walk home give every expedition a cost.
						Bring a plan, bring a friend, and leave the realm changed.
					</p>
				</div>
				<div class="manifesto-aside">CONCEIVED FOR SURVIVAL.<br />NOT FOR SIGHTSEEING.</div>
			</section>

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
</RagnarokGate>

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
		right: calc(50% + 36rem + 1rem);
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
		max-width: 100%;
		margin-inline: auto;
		overflow: hidden;
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

	.site-world {
		background:
			linear-gradient(180deg, rgba(3, 5, 5, 0.18) 0 24rem, rgba(3, 5, 5, 0.88) 48rem),
			url('/media/warheim/warheim-hero.webp') center top / max(120rem, 100vw) 48rem no-repeat,
			url('/images/backgrounds/background-main.png') center 42rem / max(100rem, 100vw) auto
				no-repeat,
			#030608;
	}

	.warheim-brand {
		min-height: 15rem;
		padding-top: 0.5rem;
	}

	.warheim-brand::after {
		content: '';
		position: absolute;
		right: 0;
		bottom: 0.35rem;
		left: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--rune-400), transparent);
		box-shadow: 0 0 16px rgba(168, 59, 67, 0.48);
	}

	.portal-grid {
		margin-top: 2.25rem;
	}

	:global(.war-hero-panel) {
		filter: drop-shadow(0 22px 30px rgba(0, 0, 0, 0.76));
	}

	:global(.war-hero-panel .panel-body) {
		min-height: 21rem;
		padding: clamp(1.4rem, 4vw, 3rem);
		background:
			linear-gradient(115deg, rgba(168, 59, 67, 0.16), transparent 40%),
			radial-gradient(circle at 82% 16%, rgba(197, 174, 112, 0.12), transparent 16rem),
			var(--panel-fill);
	}

	:global(.war-hero-panel .panel-body h2) {
		max-width: 13ch;
		font-size: clamp(2rem, 5vw, 4.2rem);
		line-height: 0.98;
		text-transform: uppercase;
	}

	:global(.war-hero-panel .panel-body h2 strong) {
		display: block;
		color: var(--rune-300);
		font-weight: 400;
	}

	:global(.war-hero-panel .welcome > p:not(.section-kicker)) {
		max-width: 52ch;
		font-size: 0.9rem;
		line-height: 1.8;
	}

	.aside-copy {
		margin: 0 0 1rem;
		color: var(--text-muted);
		font-size: 0.72rem;
		line-height: 1.7;
	}

	.discord-action {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.7rem 0.85rem;
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.62rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	.threat-strip {
		position: relative;
		z-index: 5;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin: 0 auto;
		border-block: 1px solid rgba(197, 174, 112, 0.38);
		background: rgba(3, 6, 7, 0.84);
		box-shadow: 0 18px 32px rgba(0, 0, 0, 0.46);
	}

	.threat-strip > div {
		display: grid;
		grid-template-columns: 2.3rem 1fr;
		column-gap: 0.65rem;
		align-items: center;
		padding: 1rem 1.25rem;
	}

	.threat-strip > div + div {
		border-left: 1px solid rgba(197, 174, 112, 0.22);
	}

	.threat-strip span {
		grid-row: span 2;
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 0.72rem;
	}

	.threat-strip strong {
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.74rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.threat-strip small {
		color: var(--text-muted);
		font-size: 0.62rem;
	}

	.manifesto-section {
		display: grid;
		grid-template-columns: minmax(10rem, 0.6fr) minmax(0, 1.8fr) minmax(10rem, 0.8fr);
		gap: 2rem;
		align-items: end;
		padding: 7rem 1rem 5rem;
		border-bottom: 1px solid rgba(197, 174, 112, 0.22);
	}

	.manifesto-index,
	.manifesto-aside {
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		line-height: 1.7;
		text-transform: uppercase;
	}

	.manifesto-copy h2 {
		max-width: 15ch;
		margin: 0 0 1rem;
		color: var(--frost-100);
		font-size: clamp(2rem, 5vw, 4.3rem);
		line-height: 0.98;
		text-transform: uppercase;
	}

	.manifesto-copy h2 span,
	.manifesto-copy h2 strong {
		display: block;
	}

	.manifesto-copy h2 strong {
		color: var(--rune-300);
		font-weight: 400;
	}

	.manifesto-copy > p:last-child {
		max-width: 52ch;
		margin: 0;
		color: var(--text-muted);
		font-size: 0.86rem;
		line-height: 1.8;
	}

	.manifesto-aside {
		color: var(--brass-400);
		text-align: right;
	}

	@media (max-width: 75rem) {
		.world-art {
			opacity: 0.54;
		}

		.world-art--wolf {
			left: -13rem;
		}

		.world-art--warrior {
			display: none;
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

		.site-world {
			background-size:
				auto 38rem,
				auto 38rem,
				auto 52rem;
			background-position:
				58% top,
				58% top,
				42% 38rem;
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

		.threat-strip {
			grid-template-columns: 1fr;
		}

		.threat-strip > div + div {
			border-top: 1px solid rgba(197, 174, 112, 0.22);
			border-left: 0;
		}

		.manifesto-section {
			grid-template-columns: 1fr;
			gap: 1.25rem;
			padding: 4rem 0.5rem 3rem;
		}

		.manifesto-aside {
			text-align: left;
		}
	}
</style>
