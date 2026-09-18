<script lang="ts">
	import FantasyFooter from '$lib/components/fantasy/FantasyFooter.svelte';
	import FantasyNavigation from '$lib/components/fantasy/FantasyNavigation.svelte';
	import FantasyPanel from '$lib/components/fantasy/FantasyPanel.svelte';
	import NewsCard from '$lib/components/fantasy/NewsCard.svelte';
	import PortalBrand from '$lib/components/fantasy/PortalBrand.svelte';
	import PortalStatusRail from '$lib/components/fantasy/PortalStatusRail.svelte';
	import PortalSystemsRail from '$lib/components/fantasy/PortalSystemsRail.svelte';
	import RagnarokGate from '$lib/components/fantasy/RagnarokGate.svelte';
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
	<div class="site-world portal-home">
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
					<aside class="portal-sidebar portal-sidebar--left" aria-label="Realm chronicle">
						<PortalSystemsRail />
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
						<PortalStatusRail />
					</aside>
				</div>
			</div>
		</main>

		<FantasyFooter />
	</div>
</RagnarokGate>

<style>
	:global(.welcome-panel) {
		margin-bottom: 1.5rem;
	}

	:global(.portal-home .welcome) {
		padding: 0.5rem 0.25rem 0.35rem;
	}

	:global(.portal-home .welcome > p:not(.section-kicker)) {
		color: #bbc9c6;
		font-size: 0.83rem;
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
</style>
