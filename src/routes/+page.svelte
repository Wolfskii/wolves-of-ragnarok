<script lang="ts">
	import FantasyFooter from '$lib/components/fantasy/FantasyFooter.svelte';
	import FantasyNavigation from '$lib/components/fantasy/FantasyNavigation.svelte';
	import FantasyPanel from '$lib/components/fantasy/FantasyPanel.svelte';
	import NewsCard from '$lib/components/fantasy/NewsCard.svelte';
	import PortalBrand from '$lib/components/fantasy/PortalBrand.svelte';
	import RagnarokGate from '$lib/components/fantasy/RagnarokGate.svelte';
	import RealmSystems from '$lib/components/fantasy/RealmSystems.svelte';
	import ServerStatus from '$lib/components/fantasy/ServerStatus.svelte';
	import { resolve } from '$app/paths';
	import { ArrowRight } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const fallbackNews = [
		{
			slug: 'valheim-1-0-has-arrived',
			title: 'Valheim 1.0 Has Arrived',
			excerpt:
				'The Deep North is open. Read what changed and prepare the Wolves for their first expedition.',
			body: 'Iron Gate has released Valheim 1.0 and opened the road into the Deep North. The update is a major new chapter for the tenth world, with new places to explore, new ways to build and fight, and more reasons to gather a group before setting out.\n\n## What was added in Valheim 1.0\n\n### The Deep North\n\n- A brand-new Deep North biome.\n- New locations to discover.\n- New creatures and events.\n- New mechanics and music.\n\n### Weapons and equipment\n\n- 40+ new weapons.\n- New bombs and ammunition.\n- Four new armor sets.\n- Two new capes and two new trinkets.\n- New tools.\n- Upgradeable pockets.\n\n### Building, crafting, and food\n\n- 80+ new buildable pieces.\n- Five new crafting-related build pieces.\n- 30+ new crafting materials.\n- 20+ new food items.\n- New locations, events, and achievements.\n\nThe Wolves are taking the pack north together. Bring warmth, supplies, and a willingness to learn the new threats as a group.',
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
				<header>
					<PortalBrand />
					<FantasyNavigation />
				</header>

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
					class="world-art world-art--male-warrior"
					src="/images/characters/viking-warrior-right.webp"
					alt=""
					width="1024"
					height="1536"
					aria-hidden="true"
				/>
				<div class="portal-grid">
					<aside class="portal-sidebar portal-sidebar--left" aria-label="Realm systems">
						<RealmSystems />
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
										>Enter Yggdrasil <ArrowRight size={16} /></a
									>
									<a class="secondary-action" href={resolve('/about')}>Know the realm</a>
								</div>
							</div>
						</FantasyPanel>

						<FantasyPanel>
							<div class="news-list">
								{#each news as article (article.title)}
									<NewsCard {...article} />
								{/each}
							</div>
						</FantasyPanel>
					</div>

					<aside class="portal-sidebar portal-sidebar--right" aria-label="Server status">
						<ServerStatus showInfoLink />
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
				<div class="manifesto-index">
					<div>ᛉ · THE FIRST LAW</div>
					<img
						class="manifesto-warrior"
						src="/images/characters/shieldmaiden-left.webp"
						alt=""
						width="1024"
						height="1536"
						loading="lazy"
						aria-hidden="true"
					/>
				</div>
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

	.world-art--male-warrior {
		top: calc(29rem + clamp(20rem, 29vw, 30rem) - clamp(25.5rem, 36vw, 37.5rem) + 0.5rem);
		left: clamp(-25rem, -21vw, -14rem);
		z-index: 3;
		width: clamp(17rem, 24vw, 25rem);
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

	.site-world {
		background:
			linear-gradient(180deg, rgba(3, 5, 5, 0.18) 0 24rem, rgba(3, 5, 5, 0.88) 48rem),
			url('/media/warheim/warheim-hero.webp') center top / max(120rem, 100vw) 48rem no-repeat,
			url('/images/backgrounds/background-main.png') center 42rem / max(100rem, 100vw) auto
				no-repeat,
			#030608;
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

	.threat-strip {
		position: relative;
		z-index: 5;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin: 0 auto;
		border-block: 1px solid rgba(197, 174, 112, 0.38);
		background: #030607;
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
		position: relative;
		z-index: 5;
		display: grid;
		grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.8fr) minmax(10rem, 0.8fr);
		gap: 2rem;
		align-items: end;
		padding: 7rem 1rem 5rem;
		border-bottom: 1px solid rgba(197, 174, 112, 0.22);
		background: #030607;
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

	.manifesto-warrior {
		display: block;
		width: min(100%, 19rem);
		height: 25rem;
		margin: 1rem auto -5rem;
		object-fit: contain;
		object-position: center bottom;
		filter: drop-shadow(0 20px 28px #000);
		pointer-events: none;
		user-select: none;
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
	}

	@media (max-width: 64rem) {
		.portal-crown {
			top: 17rem;
		}

		.world-art--wolf {
			top: 33rem;
			left: -9rem;
		}

		.world-art--male-warrior {
			top: calc(33rem + clamp(20rem, 29vw, 30rem) - clamp(25.5rem, 36vw, 37.5rem) + 0.5rem);
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

		.manifesto-warrior {
			display: none;
		}
	}
</style>
