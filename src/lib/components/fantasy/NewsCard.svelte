<script lang="ts">
	let {
		title,
		excerpt,
		body = '',
		imageUrl,
		date,
		author,
		tone = 'frost'
	}: {
		title: string;
		excerpt: string;
		body?: string;
		imageUrl?: string;
		date: string;
		author: string;
		tone?: 'frost' | 'ember';
	} = $props();
</script>

<article class:ember={tone === 'ember'}>
	<div class="sigil" aria-hidden="true">{tone === 'ember' ? 'ᚲ' : 'ᛞ'}</div>
	<div>
		<p class="meta"><time>{date}</time><span>by {author}</span></p>
		<h3>{title}</h3>
		{#if imageUrl}<img class="news-art" src={imageUrl} alt="" loading="lazy" />{/if}
		{#if body}
			<div class="full-body">
				{#each body.split('\n') as line, index (index)}
					{#if line.startsWith('## ') || line.startsWith('# ')}
						<h4>{line.replace(/^##?\s/, '')}</h4>
					{:else if line.startsWith('- ')}
						<p class="bullet"><span aria-hidden="true">ᛟ</span>{line.slice(2)}</p>
					{:else if line.trim()}
						<p>{line}</p>
					{/if}
				{/each}
			</div>
		{:else}
			<p class="excerpt">{excerpt}</p>
		{/if}
	</div>
</article>

<style>
	article {
		display: grid;
		grid-template-columns: 3.8rem minmax(0, 1fr);
		gap: 1rem;
		padding: 1.25rem 0;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
	}

	article:first-child {
		padding-top: 0.2rem;
	}
	article:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.sigil {
		display: grid;
		place-items: center;
		width: 3.8rem;
		aspect-ratio: 1;
		border: 1px solid rgba(168, 59, 67, 0.48);
		background: radial-gradient(circle, rgba(111, 133, 140, 0.16), rgba(5, 10, 13, 0.9) 65%);
		clip-path: polygon(50% 0, 90% 18%, 100% 64%, 74% 100%, 26% 100%, 0 64%, 10% 18%);
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 1.5rem;
		text-shadow: 0 0 12px var(--rune-400);
	}

	.ember .sigil {
		border-color: rgba(227, 108, 47, 0.48);
		background: radial-gradient(circle, rgba(227, 108, 47, 0.2), rgba(5, 10, 13, 0.86) 65%);
		color: #ffc080;
		text-shadow: 0 0 12px var(--ember-500);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.75rem;
		margin: 0 0 0.25rem;
		color: var(--text-muted);
		font-size: 0.6rem;
		text-transform: uppercase;
	}

	h3 {
		margin: 0 0 0.45rem;
		color: var(--frost-100);
		font-size: 1rem;
	}

	.news-art {
		width: 100%;
		max-height: 18rem;
		margin: 0.8rem 0 1rem;
		border: 1px solid rgba(197, 174, 112, 0.28);
		object-fit: cover;
	}

	.excerpt,
	.full-body {
		margin: 0;
		color: #b2c1bf;
		font-size: 0.75rem;
		line-height: 1.65;
	}

	.full-body p {
		margin: 0 0 0.8rem;
	}
	.full-body h4 {
		margin: 1.1rem 0 0.45rem;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.95rem;
		text-transform: uppercase;
	}
	.full-body .bullet {
		display: grid;
		grid-template-columns: 1rem minmax(0, 1fr);
		gap: 0.35rem;
		margin-bottom: 0.35rem;
	}
	.bullet span {
		color: var(--rune-300);
	}

	@media (max-width: 26rem) {
		article {
			grid-template-columns: 3rem minmax(0, 1fr);
			gap: 0.75rem;
		}
		.sigil {
			width: 3rem;
		}
	}
</style>
