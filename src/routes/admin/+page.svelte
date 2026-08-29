<script lang="ts">
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import { resolve } from '$app/paths';
	import { FileText, Images, Newspaper, Server, Settings, Users } from '@lucide/svelte';

	const areas = [
		{ label: 'News', icon: Newspaper, href: '/admin/news' },
		{ label: 'Pages', icon: FileText, href: '/admin/pages' },
		{ label: 'Users', icon: Users, href: '/admin/users' },
		{ label: 'Servers', icon: Server, href: '/admin/servers' },
		{ label: 'Media', icon: Images, href: '/admin/media' },
		{ label: 'Site settings', icon: Settings, href: '/admin/site-settings' }
	] as const;
</script>

<svelte:head><title>War Council | Wolves of Ragnarok</title></svelte:head>

<PortalPageShell title="War Council" eyebrow="Administration">
	<p class="intro">Manage the guild hall without editing source code.</p>
	<div class="admin-grid">
		{#each areas as area (area.href)}
			<a href={resolve(area.href)}>
				<area.icon size={22} aria-hidden="true" />
				<span>{area.label}</span>
			</a>
		{/each}
	</div>
</PortalPageShell>

<style>
	.intro {
		color: var(--text-muted);
	}

	.admin-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		margin-top: 1.25rem;
		background: rgba(184, 197, 198, 0.18);
	}

	a {
		display: grid;
		place-items: center;
		gap: 0.55rem;
		min-height: 8rem;
		background: rgba(3, 8, 10, 0.93);
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.7rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	a:hover {
		color: var(--rune-300);
		box-shadow: inset 0 0 22px rgba(87, 215, 206, 0.11);
	}

	@media (max-width: 36rem) {
		.admin-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
