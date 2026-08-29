<script lang="ts">
	import { Menu, X } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let open = $state(false);

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/news', label: 'News' },
		{ href: '/community', label: 'Community' },
		{ href: '/servers', label: 'Servers' },
		{ href: '/members', label: 'Members' },
		{ href: '/about', label: 'About' }
	] as const;
</script>

<nav class="navigation" aria-label="Primary navigation">
	<button
		class="menu-toggle"
		type="button"
		aria-expanded={open}
		aria-controls="primary-links"
		onclick={() => (open = !open)}
	>
		{#if open}<X size={20} aria-hidden="true" />{:else}<Menu size={20} aria-hidden="true" />{/if}
		<span>Hall menu</span>
	</button>

	<ul id="primary-links" class:open>
		{#each links as link (link.href)}
			<li><a href={resolve(link.href)}>{link.label}</a></li>
		{/each}
		<li class="discord"><a href="#discord">Discord</a></li>
	</ul>
</nav>

<style>
	.navigation {
		position: relative;
		z-index: 10;
		width: min(100%, 66rem);
		margin: -0.25rem auto 0;
		border-block: 1px solid rgba(184, 197, 198, 0.32);
		background: var(--glass-metal);
		box-shadow:
			0 2px 0 #020405,
			0 8px 24px rgba(0, 0, 0, 0.74),
			inset 0 1px rgba(232, 248, 243, 0.12);
	}

	.navigation::before,
	.navigation::after {
		content: 'ᛟ';
		position: absolute;
		top: 50%;
		width: 2.4rem;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border: 1px solid var(--brass-600);
		background: #11191c;
		color: var(--brass-400);
		font-family: var(--display);
		transform: translateY(-50%) rotate(45deg);
		box-shadow: var(--shadow-deep);
	}

	.navigation::before {
		left: -1.2rem;
	}

	.navigation::after {
		right: -1.2rem;
	}

	ul {
		display: flex;
		align-items: stretch;
		justify-content: center;
		margin: 0;
		padding: 0 1.5rem;
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

	a {
		display: block;
		padding: 0.85rem 1.35rem;
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.68rem;
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			color 160ms ease,
			text-shadow 160ms ease,
			background 160ms ease;
	}

	a:hover,
	a:focus-visible {
		background: linear-gradient(180deg, transparent, rgba(168, 59, 67, 0.12), transparent);
		color: var(--frost-100);
		text-shadow: 0 0 12px var(--rune-400);
	}

	.discord a {
		color: var(--brass-400);
	}

	.menu-toggle {
		display: none;
	}

	@media (max-width: 47.99rem) {
		.navigation {
			width: calc(100% - 1.5rem);
		}

		.navigation::before,
		.navigation::after {
			width: 1.65rem;
			font-size: 0.7rem;
		}

		.navigation::before {
			left: -0.8rem;
		}

		.navigation::after {
			right: -0.8rem;
		}

		.menu-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.55rem;
			width: 100%;
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
			padding: 0.3rem 0.75rem 0.75rem;
		}

		ul.open {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		li + li::before {
			display: none;
		}

		a {
			padding: 0.75rem;
			text-align: center;
		}
	}
</style>
