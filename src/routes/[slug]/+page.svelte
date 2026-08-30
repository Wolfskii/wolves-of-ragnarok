<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags -- member bios are sanitized by the server loader. */
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import ForumAuthor from '$lib/components/fantasy/ForumAuthor.svelte';
	import ServerLiveMap from '$lib/components/fantasy/ServerLiveMap.svelte';
	import ServerStatus from '$lib/components/fantasy/ServerStatus.svelte';
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
	{:else}
		{#if data.page.title === 'Latest Chronicles'}
			<section class="news-list" aria-label="Published news">
				{#if data.newsPosts?.length}
					{#each data.newsPosts as article (article.title)}
						<article class="news-article">
							<p class="article-meta">
								{article.publishedAt?.toLocaleDateString() ?? 'Recently'} · {article.author
									.username}
							</p>
							<h2>{article.title}</h2>
							<p>{article.excerpt ?? article.body}</p>
						</article>
					{/each}
				{:else}
					<p class="empty">
						News from the hall will appear here after the first chronicle is published.
					</p>
				{/if}
			</section>
		{:else if data.page.title === 'Guild Roster'}
			<section class="member-list" aria-label="Guild members">
				{#if data.members?.length}
					{#each data.members as member (member.username)}
						<article class="member-card">
							<ForumAuthor author={member} />
							<p>{@html member.bio || 'A member of the Wolves of Ragnarok.'}</p>
							<small>{member.role} · Joined {member.createdAt.toLocaleDateString()}</small>
						</article>
					{/each}
				{:else}
					<p class="empty">The roster is currently unavailable.</p>
				{/if}
			</section>
		{:else if data.page.title === 'About Us'}
			<div class="about-copy">{data.aboutBody ?? data.page.intro}</div>
		{:else}
			<ul>
				{#each data.page.items as item (item)}
					<li><span aria-hidden="true">ᛟ</span>{item}</li>
				{/each}
			</ul>
		{/if}
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

	.news-list,
	.member-list {
		display: grid;
		gap: 0.8rem;
		margin-top: 1.5rem;
	}

	.news-article,
	.member-card {
		padding: 1rem;
		border: 1px solid rgba(137, 115, 69, 0.35);
		background: rgba(0, 3, 4, 0.42);
	}

	.news-article h2 {
		margin: 0.25rem 0 0.5rem;
		color: var(--frost-100);
		font-size: 1rem;
		text-transform: uppercase;
	}

	.news-article p,
	.member-card p,
	.about-copy {
		color: #becbc8;
		font-size: 0.8rem;
		line-height: 1.7;
	}

	.article-meta,
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
	}
</style>
