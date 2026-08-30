<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { Gamepad2, MessageCircle } from '@lucide/svelte';

	let {
		author
	}: {
		author: {
			username: string;
			steamUsername: string | null;
			steamProfileUrl: string | null;
			steamAvatarUrl: string | null;
			discordUsername: string | null;
			discordUserId: string | null;
		};
	} = $props();
</script>

<div class="author">
	{#if author.steamAvatarUrl}
		<img src={author.steamAvatarUrl} alt="" width="40" height="40" />
	{:else}
		<div class="avatar" aria-hidden="true">{author.username.slice(0, 1).toUpperCase()}</div>
	{/if}
	<div class="identity">
		<strong>{author.username}</strong>
		<div class="identity-links">
			{#if author.steamUsername}
				{#if author.steamProfileUrl}
					<a href={author.steamProfileUrl} target="_blank" rel="noreferrer">
						<Gamepad2 size={12} aria-hidden="true" />{author.steamUsername}
					</a>
				{:else}
					<span><Gamepad2 size={12} aria-hidden="true" />{author.steamUsername}</span>
				{/if}
			{/if}
			{#if author.discordUsername}
				{#if author.discordUserId}
					<a
						href={`https://discord.com/users/${author.discordUserId}`}
						target="_blank"
						rel="noreferrer"
						><MessageCircle size={12} aria-hidden="true" />{author.discordUsername}</a
					>
				{:else}
					<span><MessageCircle size={12} aria-hidden="true" />{author.discordUsername}</span>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.author {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
	}

	.avatar,
	img {
		flex: 0 0 2.5rem;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid var(--brass-600);
		background: rgba(2, 6, 8, 0.84);
	}

	.avatar {
		display: grid;
		place-items: center;
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 0.9rem;
	}

	img {
		object-fit: cover;
	}

	.identity {
		display: grid;
		gap: 0.2rem;
		min-width: 0;
	}

	.identity strong {
		overflow: hidden;
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.68rem;
		text-overflow: ellipsis;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.identity-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		color: var(--text-muted);
		font-size: 0.6rem;
	}

	.identity-links a,
	.identity-links span {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		color: var(--brass-400);
		text-decoration: none;
	}

	.identity-links a:hover,
	.identity-links a:focus-visible {
		color: var(--frost-100);
	}
</style>
