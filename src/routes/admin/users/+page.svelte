<script lang="ts">
	import PortalPageShell from '$lib/components/fantasy/PortalPageShell.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Manage Members | Wolves of Ragnarok</title></svelte:head>

<PortalPageShell title="Manage Members" eyebrow="Assign hall permissions">
	<p class="intro">Publishers can write news. Administrators can also manage members and roles.</p>
	{#if form?.usersError}<p class="error" role="alert">{form.usersError}</p>{/if}
	{#if form?.usersSuccess}<p class="success" role="status">Role updated.</p>{/if}
	<ul class="user-list">
		{#each data.users as user (user.id)}
			<li>
				<div>
					<strong>{user.username}</strong><span
						>{user.email} · {user.isActive ? 'Active' : 'Inactive'}</span
					>
				</div>
				<form method="POST" action="?/setRole">
					<input type="hidden" name="userId" value={user.id} />
					<select name="role" aria-label={`Role for ${user.username}`} value={user.role}>
						<option value="USER">User</option>
						<option value="MODERATOR">Moderator</option>
						<option value="PUBLISHER">Publisher</option>
						<option value="ADMIN">Administrator</option>
					</select>
					<button type="submit">Save role</button>
				</form>
			</li>
		{/each}
	</ul>
</PortalPageShell>

<style>
	.intro {
		color: var(--text-muted);
		font-size: 0.78rem;
	}
	.error,
	.success {
		padding: 0.65rem;
		font-size: 0.7rem;
	}
	.error {
		border-left: 2px solid var(--danger-400);
		color: #f1b1a5;
	}
	.success {
		border-left: 2px solid var(--success-400);
		color: #b5f0c9;
	}
	.user-list {
		display: grid;
		gap: 0.55rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem;
		border-bottom: 1px solid rgba(184, 197, 198, 0.12);
		background: rgba(0, 3, 4, 0.42);
	}
	li > div {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}
	strong {
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.75rem;
	}
	span {
		color: var(--text-muted);
		font-size: 0.62rem;
	}
	form {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	select,
	button {
		height: 2.25rem;
		border: 1px solid rgba(137, 115, 69, 0.5);
		border-radius: 0;
		background: var(--glass-button);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.58rem;
		text-transform: uppercase;
	}
	select {
		padding-inline: 0.45rem;
	}
	button {
		padding-inline: 0.6rem;
		cursor: pointer;
	}
	@media (max-width: 40rem) {
		li {
			align-items: stretch;
			flex-direction: column;
		}
		form {
			flex-wrap: wrap;
		}
	}
</style>
