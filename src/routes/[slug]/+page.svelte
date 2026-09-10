<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags -- member bios are sanitized by the server loader. */
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import ServerLiveMap from '$lib/components/fantasy/ServerLiveMap.svelte';
	import ServerStatus from '$lib/components/fantasy/ServerStatus.svelte';
	import ValheimWikiSearch from '$lib/components/fantasy/ValheimWikiSearch.svelte';
	import { resolve } from '$app/paths';
	import type { PageData, PageServerData } from './$types';

	let { data }: { data: PageData & PageServerData } = $props();
</script>

<svelte:head>
	<title>{data.page.title} | Wolves of Ragnarok</title>
	<meta name="description" content={data.page.intro} />
</svelte:head>

<PortalPageShell title={data.page.title} eyebrow={data.page.eyebrow}>
	<p class="intro">{data.page.intro}</p>
	{#if data.page.title === 'Game Servers'}
		<div class="server-overview">
			<div class="server-status">
				<ServerStatus detailed canRevealPassword={Boolean(data.user)} />
			</div>
			<ServerLiveMap />
		</div>
	{:else if data.page.title === 'Guild Roster'}
		<section class="member-list" aria-label="Guild members">
			{#if data.members?.length}
				{#each data.members as member (member.username)}
					<article class="member-card">
						<h2 class="member-name">{member.username}</h2>
						<p>{@html member.bio || 'A member of the Wolves of Ragnarok.'}</p>
						<small>{member.role} · Joined {member.createdAt.toLocaleDateString()}</small>
					</article>
				{/each}
			{:else}
				<p class="empty">The roster is currently unavailable.</p>
			{/if}
		</section>
	{:else if data.page.title === 'Survive the Realm'}
		<section class="realm-page">
			<div class="realm-page-heading">
				<p class="section-kicker">The first law // survive together</p>
				<h2><span>The world will</span><strong>test you.</strong></h2>
				<p>{data.page.intro}</p>
			</div>
			<div class="realm-law-grid">
				{#each data.page.items as item, index (item)}
					<article>
						<span class="law-rune" aria-hidden="true">{['ᚦ', 'ᛏ', 'ᛉ', 'ᚷ'][index] ?? 'ᛟ'}</span>
						<h3>{['Preparation is power', 'Read the threat', 'Return better'][index]}</h3>
						<p>{item}</p>
					</article>
				{/each}
			</div>
			<p class="realm-callout">
				No one survives alone. Make the plan in Discord, step through the gates together, and leave
				Yggdrasil with a story worth bringing home.
			</p>
		</section>
	{:else if data.page.title === 'About Us'}
		<section class="about-page">
			<div class="about-lead">
				<p class="section-kicker">A gaming community, not a single server</p>
				<h2><span>Good games.</span><strong>Better company.</strong></h2>
				<p>
					Wolves of Ragnarok is an English and Swedish gaming community for people who want a place
					to play, talk, and return to. Valheim is one of our homes, but it is not the limit of the
					community.
				</p>
			</div>
			<div class="about-grid">
				<article>
					<span>01</span>
					<h3>Many games, one community</h3>
					<p>
						We play together across different games and genres. Bring the game you are currently
						enjoying and find people who are happy to join.
					</p>
				</article>
				<article>
					<span>02</span>
					<h3>Yggdrasil</h3>
					<p>
						Our Valheim server launched for the 1.0 release and its new content. It is a shared
						world for building, exploring, and taking on the Deep North together.
					</p>
				</article>
				<article>
					<span>03</span>
					<h3>Discord first</h3>
					<p>
						Discord is where we organize sessions, share updates, help with builds, and keep the
						conversation moving between games.
					</p>
				</article>
				<article>
					<span>04</span>
					<h3>English and Swedish</h3>
					<p>
						Our community welcomes both languages. Clear communication, patience, and respect matter
						more than where you are from.
					</p>
				</article>
			</div>
			<a class="about-discord" href="https://discord.gg/CbjgD7WVfp" target="_blank" rel="noreferrer"
				>Join us on Discord ↗</a
			>
		</section>
	{:else if data.page.title === 'Realm Wiki'}
		<ValheimWikiSearch />
	{:else if data.page.title === 'Contact the Hall'}
		<ul>
			<li>
				<span aria-hidden="true">ᛟ</span><a
					href="https://discord.gg/CbjgD7WVfp"
					target="_blank"
					rel="noreferrer">Join the Wolves of Ragnarok Discord server</a
				>
			</li>
			{#each data.page.items.slice(1) as item (item)}
				<li><span aria-hidden="true">ᛟ</span>{item}</li>
			{/each}
		</ul>
	{:else}
		<ul>
			{#each data.page.items as item (item)}
				<li><span aria-hidden="true">ᛟ</span>{item}</li>
			{/each}
		</ul>
	{/if}
	<p class="return"><a href={resolve('/')}>Return to the great hall</a></p>
</PortalPageShell>

<style>
	.intro {
		color: #becbc8;
		font-size: 0.88rem;
	}
	.server-overview {
		display: grid;
		grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
		align-items: start;
		gap: 1.5rem;
		margin: 2rem auto;
	}
	.server-status {
		width: 100%;
	}
	ul {
		display: grid;
		gap: 0.6rem;
		margin: 1.5rem 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
		background: rgba(255, 255, 255, 0.015);
	}
	li span {
		color: var(--rune-400);
	}
	.member-list {
		display: grid;
		gap: 0.8rem;
		margin-top: 1.5rem;
	}
	.member-card {
		padding: 1rem;
		border: 1px solid rgba(137, 115, 69, 0.35);
		background: rgba(0, 3, 4, 0.42);
	}
	.member-card p,
	.about-copy {
		color: #becbc8;
		font-size: 0.8rem;
		line-height: 1.7;
	}
	.member-card small {
		margin: 0;
		color: var(--brass-400);
		font-size: 0.62rem;
	}
	.member-card p {
		margin: 0.75rem 0 0.35rem;
	}
	.about-copy {
		margin-top: 1.5rem;
		white-space: pre-line;
	}

	.about-page {
		margin-top: 1.5rem;
	}

	.about-lead {
		padding: 1rem 0 2rem;
		border-bottom: 1px solid rgba(197, 174, 112, 0.25);
	}

	.about-lead h2 {
		max-width: 12ch;
		margin: 0 0 1rem;
		color: var(--frost-100);
		font-size: clamp(2rem, 6vw, 4.5rem);
		line-height: 0.96;
		text-transform: uppercase;
	}

	.about-lead h2 span,
	.about-lead h2 strong {
		display: block;
	}

	.about-lead h2 strong {
		color: var(--rune-300);
		font-weight: 400;
	}

	.about-lead > p:last-child {
		max-width: 58ch;
		margin: 0;
		color: var(--text-muted);
		font-size: 0.86rem;
		line-height: 1.8;
	}

	.about-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.about-grid article {
		padding: 1rem;
		border: 1px solid rgba(126, 132, 119, 0.3);
		background: linear-gradient(135deg, rgba(29, 36, 31, 0.68), rgba(8, 11, 10, 0.8));
	}

	.about-grid article > span {
		color: var(--rune-300);
		font-family: var(--code);
		font-size: 0.62rem;
	}

	.about-grid h3 {
		margin: 1.1rem 0 0.5rem;
		color: var(--frost-100);
		font-size: 1.05rem;
		text-transform: uppercase;
	}

	.about-grid p {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.75rem;
		line-height: 1.7;
	}

	.about-discord {
		display: inline-flex;
		margin-top: 1.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--rune-400);
		background: rgba(143, 17, 25, 0.55);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.65rem;
		text-decoration: none;
		text-transform: uppercase;
	}
	.realm-page {
		margin-top: 1.5rem;
	}
	.realm-page-heading {
		padding: 1rem 0 2rem;
		border-bottom: 1px solid rgba(197, 174, 112, 0.25);
	}
	.realm-page-heading h2 {
		max-width: 12ch;
		margin: 0 0 1rem;
		color: var(--frost-100);
		font-size: clamp(2rem, 6vw, 4.5rem);
		line-height: 0.96;
		text-transform: uppercase;
	}
	.realm-page-heading h2 span,
	.realm-page-heading h2 strong {
		display: block;
	}
	.realm-page-heading h2 strong {
		color: var(--rune-300);
		font-weight: 400;
	}
	.realm-page-heading > p:last-child {
		max-width: 55ch;
		margin: 0;
		color: var(--text-muted);
		font-size: 0.85rem;
		line-height: 1.8;
	}
	.realm-law-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1.5rem;
	}
	.realm-law-grid article {
		min-height: 14rem;
		padding: 1.1rem;
		border: 1px solid rgba(126, 132, 119, 0.3);
		background: linear-gradient(135deg, rgba(29, 36, 31, 0.68), rgba(8, 11, 10, 0.8));
	}
	.law-rune {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		margin-bottom: 1.4rem;
		border: 1px solid var(--rune-400);
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 1.1rem;
	}
	.realm-law-grid h3 {
		margin: 0 0 0.55rem;
		color: var(--frost-100);
		font-size: 1.05rem;
		text-transform: uppercase;
	}
	.realm-law-grid p {
		margin: 0;
		color: var(--text-muted);
		font-size: 0.74rem;
		line-height: 1.7;
	}
	.realm-callout {
		margin: 1.5rem 0 0;
		padding: 1rem;
		border-left: 2px solid var(--rune-400);
		background: rgba(143, 17, 25, 0.11);
		color: var(--brass-400);
		font-family: var(--manuscript);
		font-size: 1.05rem;
		font-style: italic;
	}
	.empty {
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.return {
		margin: 1.5rem 0 0;
		font-family: var(--display);
		font-size: 0.65rem;
		text-transform: uppercase;
	}
	.return a {
		color: var(--brass-400);
	}
	@media (max-width: 47.99rem) {
		.server-overview {
			grid-template-columns: minmax(0, 1fr);
		}
		.server-status {
			max-width: 24rem;
			margin-inline: auto;
		}
		.realm-law-grid {
			grid-template-columns: 1fr;
		}

		.about-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
