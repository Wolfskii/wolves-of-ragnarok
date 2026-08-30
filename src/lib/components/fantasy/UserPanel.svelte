<script lang="ts">
	import { LogOut, MessageCircle, Settings, Shield } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { SessionUser } from '$lib/server/auth/session';

	let { user }: { user: SessionUser } = $props();
</script>

<section class="user-shrine" aria-labelledby="user-heading">
	<div class="user-slab">
		{#if user.avatarUrl || user.steamAvatarUrl}
			<img
				class="avatar avatar-image"
				src={user.avatarUrl ?? user.steamAvatarUrl ?? ''}
				alt=""
				width="48"
				height="48"
			/>
		{:else}
			<div class="avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</div>
		{/if}
		<p class="role"><Shield size={13} />{user.role}</p>
		<h2 id="user-heading">{user.username}</h2>
		{#if user.discordUsername}<p class="discord-handle">
				<MessageCircle size={13} />{user.discordUsername}
			</p>{/if}
		<p class="welcome">The longhouse remembers you.</p>
		<a class="profile" href={resolve('/profile')}><Settings size={16} />View profile</a>
		<form method="POST" action="/logout">
			<button type="submit"><LogOut size={16} />Leave the hall</button>
		</form>
	</div>
</section>

<style>
	.user-shrine {
		position: relative;
	}

	.user-slab {
		position: relative;
		z-index: 3;
		padding: 1.4rem 1.2rem 1.2rem;
		border: 1px solid rgba(168, 59, 67, 0.42);
		background: var(--glass-metal);
		clip-path: polygon(
			0.75rem 0,
			calc(100% - 0.75rem) 0,
			100% 0.75rem,
			100% calc(100% - 1rem),
			calc(100% - 1rem) 100%,
			1rem 100%,
			0 calc(100% - 1rem),
			0 0.75rem
		);
		box-shadow:
			inset 0 0 28px rgba(168, 59, 67, 0.1),
			var(--shadow-deep);
		text-align: center;
	}

	.avatar {
		display: grid;
		place-items: center;
		width: 3rem;
		aspect-ratio: 1;
		margin: 0 auto 0.65rem;
		border: 1px solid var(--brass-600);
		background: rgba(2, 6, 8, 0.84);
		color: var(--rune-300);
		font-family: var(--display);
		font-size: 1.2rem;
		transform: rotate(45deg);
	}

	.avatar-image {
		object-fit: cover;
		transform: none;
	}

	.avatar::first-letter {
		transform: rotate(-45deg);
	}

	.role {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		margin: 0;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.58rem;
		text-transform: uppercase;
	}

	h2 {
		margin: 0.3rem 0;
		color: var(--frost-100);
		font-size: 1rem;
		text-transform: uppercase;
	}

	.discord-handle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		margin: 0 0 0.35rem;
		color: var(--brass-400);
		font-size: 0.68rem;
		text-decoration: none;
	}

	.discord-handle:hover,
	.discord-handle:focus-visible {
		color: var(--frost-100);
	}

	.welcome {
		margin: 0 0 0.85rem;
		color: var(--text-muted);
		font-size: 0.67rem;
	}

	.profile,
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		width: 100%;
		min-height: 2.4rem;
		border: 1px solid var(--brass-600);
		background: var(--glass-button);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.6rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	form {
		margin-top: 0.5rem;
	}

	button {
		border-color: rgba(111, 133, 140, 0.35);
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
	}

	@media (max-width: 47.99rem) {
		.user-shrine {
			width: min(100%, 24rem);
			margin-inline: auto;
		}
	}
</style>
