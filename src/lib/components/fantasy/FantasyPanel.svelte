<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		eyebrow,
		children,
		class: className = ''
	}: { title?: string; eyebrow?: string; children: Snippet; class?: string } = $props();
</script>

<section class={`panel ${className}`}>
	<div class="panel-cap" aria-hidden="true"><span>ᛉ</span><i></i><span>ᛏ</span></div>
	<div class="panel-body">
		{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
		{#if title}<h2>{title}</h2>{/if}
		{@render children()}
	</div>
	<div class="panel-foot" aria-hidden="true"><span></span></div>
</section>

<style>
	.panel {
		position: relative;
		filter: drop-shadow(0 18px 20px rgba(0, 0, 0, 0.62));
	}

	.panel-cap {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.75rem;
		height: 2rem;
		padding-inline: 1rem;
		border: 1px solid rgba(139, 163, 163, 0.48);
		background: linear-gradient(180deg, #354247, #111a1d 45%, #05090b 48%, #202d31);
		clip-path: polygon(
			0.75rem 0,
			calc(100% - 0.75rem) 0,
			100% 50%,
			calc(100% - 0.75rem) 100%,
			0.75rem 100%,
			0 50%
		);
		box-shadow:
			inset 0 1px rgba(255, 255, 255, 0.15),
			var(--glow-rune);
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.68rem;
	}

	.panel-cap i {
		height: 1px;
		background: linear-gradient(90deg, var(--brass-600), var(--steel-300), var(--brass-600));
	}

	.panel-body {
		position: relative;
		margin-inline: 0.55rem;
		padding: 1.25rem;
		border-inline: 1px solid var(--panel-line);
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.025), transparent 34%),
			repeating-linear-gradient(0deg, transparent 0 4px, rgba(255, 255, 255, 0.008) 4px 5px),
			var(--panel-fill);
		box-shadow:
			inset 14px 0 22px -20px var(--rune-400),
			inset -14px 0 22px -20px var(--ember-500);
	}

	.panel-body::before,
	.panel-body::after {
		content: '';
		position: absolute;
		inset-block: 0.5rem;
		width: 3px;
		background: repeating-linear-gradient(180deg, var(--brass-600) 0 4px, transparent 4px 11px);
		opacity: 0.45;
	}

	.panel-body::before {
		left: -2px;
	}

	.panel-body::after {
		right: -2px;
	}

	.eyebrow {
		margin: 0 0 0.25rem;
		color: var(--rune-400);
		font-family: var(--display);
		font-size: 0.62rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.14em;
	}

	h2 {
		margin: 0 0 1rem;
		color: var(--frost-100);
		font-size: 1.15rem;
		font-weight: 600;
		text-transform: uppercase;
		text-shadow: 0 0 15px rgba(168, 59, 67, 0.25);
	}

	.panel-foot {
		position: relative;
		height: 1rem;
		margin-inline: 0.35rem;
		border-top: 1px solid rgba(184, 197, 198, 0.36);
		background: linear-gradient(180deg, #111a1d, #050809);
		clip-path: polygon(0 0, 100% 0, calc(100% - 1rem) 100%, 1rem 100%);
	}

	.panel-foot span {
		position: absolute;
		left: 50%;
		top: -0.18rem;
		width: 1.7rem;
		height: 0.55rem;
		border: 1px solid var(--brass-600);
		background: var(--ink-900);
		transform: translateX(-50%);
	}
</style>
