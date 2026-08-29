<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		title,
		excerpt,
		date,
		author,
		tone = 'frost'
	}: {
		title: string;
		excerpt: string;
		date: string;
		author: string;
		tone?: 'frost' | 'ember';
	} = $props();
</script>

<article class:ember={tone === 'ember'}>
	<div class="sigil" aria-hidden="true">{tone === 'ember' ? 'ᚲ' : 'ᛞ'}</div>
	<div>
		<p class="meta"><time>{date}</time><span>by {author}</span></p>
		<h3><a href={resolve('/news')}>{title}</a></h3>
		<p class="excerpt">{excerpt}</p>
		<a class="read-more" href={resolve('/news')}
			>Read the chronicle <span aria-hidden="true">→</span></a
		>
	</div>
</article>

<style>
	article {
		display: grid;
		grid-template-columns: 3.8rem minmax(0, 1fr);
		gap: 1rem;
		padding: 1rem 0;
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
		border: 1px solid rgba(87, 215, 206, 0.42);
		background: radial-gradient(circle, rgba(87, 215, 206, 0.2), rgba(5, 10, 13, 0.86) 65%);
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
		font-size: 1rem;
	}

	h3 a {
		color: var(--frost-100);
		text-decoration: none;
	}

	.excerpt {
		margin: 0;
		color: #b2c1bf;
		font-size: 0.75rem;
		line-height: 1.65;
	}

	.read-more {
		display: inline-block;
		margin-top: 0.55rem;
		font-family: var(--display);
		font-size: 0.58rem;
		font-weight: 600;
		text-transform: uppercase;
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
