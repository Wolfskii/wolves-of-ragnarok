<script lang="ts">
	import WarheimAudioPlayer from '$lib/components/fantasy/WarheimAudioPlayer.svelte';
	import { Menu, X } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let open = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/merch', label: 'Merch' },
		{ href: '/wiki', label: 'Wiki' },
		{ href: '/rules', label: 'Rules' }
	] as const;
</script>

<nav class="navigation" aria-label="Primary navigation">
	<a class="nav-brand" href={resolve('/')} aria-label="Wolves of Ragnarok home">
		<img src="/images/branding/logo-wolf-light.png" alt="" width="576" height="642" />
		<strong>Wolves of Ragnarok</strong>
	</a>

	<button
		class="menu-toggle"
		type="button"
		aria-expanded={open}
		aria-controls="primary-links"
		onclick={() => (open = !open)}
	>
		{#if open}<X size={20} aria-hidden="true" />{:else}<Menu size={20} aria-hidden="true" />{/if}
		<span>Realm menu</span>
	</button>

	<ul id="primary-links" class:open>
		{#each links as link (link.href)}
			<li><a href={resolve(link.href)}>{link.label}</a></li>
		{/each}
	</ul>

	<div class="nav-right">
		<WarheimAudioPlayer />
		<a class="nav-cta" href="https://discord.gg/CbjgD7WVfp" target="_blank" rel="noreferrer"
			>Join Discord <span>↗</span></a
		>
	</div>
</nav>

<style>
	.navigation {
		position: relative;
		z-index: 10;
		display: grid;
		grid-template-columns: 10.5rem minmax(0, 1fr) auto;
		align-items: center;
		width: min(100%, 80rem);
		min-height: 3.8rem;
		margin: -0.25rem auto 0;
		border-block: 1px solid rgba(126, 132, 119, 0.35);
		background: rgba(5, 8, 8, 0.9);
		box-shadow:
			0 2px 0 #020405,
			0 8px 24px rgba(0, 0, 0, 0.74),
			inset 0 1px rgba(232, 248, 243, 0.08);
		background-image: repeating-linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.015) 0 1px,
			transparent 1px 48px
		);
	}

	.navigation::after {
		content: '';
		position: absolute;
		inset: auto 0 -2px;
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--rune-400), transparent);
		box-shadow: 0 0 14px var(--rune-400);
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		height: 2.9rem;
		padding: 0 0.7rem;
		border-right: 1px solid rgba(126, 132, 119, 0.25);
		color: var(--frost-100);
		text-decoration: none;
	}

	.nav-brand img {
		width: 2rem;
		height: 2.25rem;
		object-fit: contain;
		filter: drop-shadow(0 0 8px rgba(168, 59, 67, 0.42));
	}

	.nav-brand strong {
		display: block;
	}

	.nav-brand strong {
		font-family: var(--display);
		font-size: 0.52rem;
		letter-spacing: 0.12em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	ul {
		display: flex;
		align-items: stretch;
		justify-content: flex-start;
		margin: 0;
		padding: 0 0.55rem;
		list-style: none;
	}

	li {
		position: relative;
	}

	li + li::before {
		content: '';
		position: absolute;
		inset-block: 28%;
		left: 0;
		width: 1px;
		background: linear-gradient(transparent, var(--brass-600), transparent);
	}

	ul a {
		display: block;
		padding: 1.45rem 0.72rem 1.2rem;
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.53rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			color 160ms ease,
			text-shadow 160ms ease,
			background 160ms ease;
	}

	ul a:hover,
	ul a:focus-visible {
		background: linear-gradient(180deg, transparent, rgba(111, 133, 140, 0.12), transparent);
		color: var(--frost-100);
		text-shadow: 0 0 12px var(--rune-400);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0 0.65rem;
	}

	.nav-cta {
		padding: 0.76rem 0.9rem;
		color: var(--frost-100);
		white-space: nowrap;
	}

	.nav-cta span {
		margin-left: 0.45rem;
		color: var(--rune-300);
	}

	.menu-toggle {
		display: none;
	}

	@media (max-width: 47.99rem) {
		.navigation {
			grid-template-columns: 1fr auto;
			width: calc(100% - 1rem);
			padding: 0.45rem 0.55rem;
		}

		.nav-brand {
			border-right: 0;
			padding-left: 0.2rem;
		}

		.menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.55rem;
			width: auto;
			padding: 0 0.5rem;
			min-height: 3rem;
			border: 0;
			background: transparent;
			color: var(--frost-200);
			font-family: var(--display);
			font-size: 0.72rem;
			text-transform: uppercase;
		}

		ul {
			display: none;
			grid-column: 1 / -1;
			padding: 0.45rem 0.2rem 0.2rem;
		}

		ul.open {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		li + li::before {
			display: none;
		}

		ul a {
			padding: 0.75rem 0.35rem;
			text-align: left;
		}

		.nav-right {
			grid-column: 1 / -1;
			justify-content: center;
			padding: 0;
		}

		.nav-cta {
			display: none;
		}
	}
</style>
