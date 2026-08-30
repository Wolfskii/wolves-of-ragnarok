<script lang="ts">
	import AuthPageShell from '$lib/components/fantasy/AuthPageShell.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Your Guild Profile | Wolves of Ragnarok</title></svelte:head>

<AuthPageShell
	title="Guild Profile"
	eyebrow={`${data.profile.role} since ${new Date(data.profile.createdAt).getFullYear()}`}
>
	<div class="identity">
		<strong>@{data.profile.username}</strong>
		<span>{data.profile.email}</span>
		{#if data.profile.steamUsername}<small>Steam: {data.profile.steamUsername}</small>{/if}
	</div>

	{#if form?.profileError}<p class="error" role="alert">{form.profileError}</p>{/if}
	{#if form?.profileSuccess}<p class="success" role="status">Profile updated.</p>{/if}
	<form method="POST" action="?/profile">
		<label
			>Steam profile link <span>(optional, fetches Steam name and avatar)</span><input
				name="steamProfileUrl"
				type="url"
				inputmode="url"
				placeholder="https://steamcommunity.com/id/..."
				value={data.profile.steamProfileUrl ?? ''}
			/></label
		>
		<label
			>Bio<textarea name="bio" rows="6" maxlength="1000">{data.profile.bio ?? ''}</textarea></label
		>
		<button type="submit">Update profile</button>
	</form>

	<div class="divider" aria-hidden="true">ᛟ</div>

	<h3>Change Password</h3>
	{#if form?.passwordError}<p class="error" role="alert">{form.passwordError}</p>{/if}
	{#if form?.passwordSuccess}<p class="success" role="status">
			Password changed and other sessions revoked.
		</p>{/if}
	<form method="POST" action="?/password">
		<label
			>Current password<input
				name="currentPassword"
				autocomplete="current-password"
				required
			/></label
		>
		<label
			>New password<input
				name="newPassword"
				type="password"
				autocomplete="new-password"
				minlength="12"
				required
			/></label
		>
		<label
			>Confirm new password<input
				name="confirmPassword"
				type="password"
				autocomplete="new-password"
				minlength="12"
				required
			/></label
		>
		<button type="submit">Change password</button>
	</form>
</AuthPageShell>

<style>
	.identity {
		display: grid;
		margin-bottom: 1.25rem;
	}

	.identity strong {
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 1.25rem;
	}

	.identity span {
		color: var(--text-muted);
		font-size: 0.7rem;
	}

	.identity small {
		color: var(--brass-400);
		font-size: 0.65rem;
	}

	form,
	label {
		display: grid;
		gap: 0.55rem;
	}

	form {
		gap: 0.85rem;
	}

	label,
	h3 {
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.62rem;
		text-transform: uppercase;
	}

	input,
	textarea {
		width: 100%;
		border: 1px solid rgba(168, 59, 67, 0.42);
		border-radius: 0;
		background: rgba(0, 3, 4, 0.84);
		box-shadow: inset 0 1px 8px #000;
		color: var(--frost-100);
		padding: 0.7rem;
	}

	input {
		height: 2.7rem;
	}

	textarea {
		resize: vertical;
	}

	button {
		min-height: 2.7rem;
		border: 1px solid var(--brass-600);
		border-radius: 0;
		background: var(--glass-button);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.64rem;
		text-transform: uppercase;
		cursor: pointer;
	}

	.divider {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0;
		color: var(--brass-400);
		text-align: center;
	}

	.error,
	.success {
		padding: 0.65rem;
		font-size: 0.7rem;
	}

	.error {
		border-left: 2px solid var(--danger-400);
		background: rgba(101, 27, 19, 0.28);
		color: #f1b1a5;
	}

	.success {
		border-left: 2px solid var(--success-400);
		background: rgba(25, 91, 54, 0.24);
		color: #b5f0c9;
	}
</style>
