<script lang="ts">
	import AuthPageShell from '$lib/components/fantasy/AuthPageShell.svelte';
	import { Gamepad2, MessageCircle } from '@lucide/svelte';
	import RichTextEditor from '$lib/components/fantasy/RichTextEditor.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Your Guild Profile | Wolves of Ragnarok</title></svelte:head>

<AuthPageShell
	title="Guild Profile"
	eyebrow={`${data.profile.role} since ${new Date(data.profile.createdAt).getFullYear()}`}
>
	<div class="identity">
		{#if data.profile.avatarMediaId || data.profile.steamAvatarUrl}
			<img
				class="profile-avatar"
				src={data.profile.avatarMediaId
					? `/api/media/${data.profile.avatarMediaId}`
					: (data.profile.steamAvatarUrl ?? '')}
				alt=""
				width="72"
				height="72"
			/>
		{/if}
		<strong>@{data.profile.username}</strong>
		<span>{data.profile.email}</span>
		{#if data.profile.steamUsername}<small
				><Gamepad2 size={13} /> Steam: {data.profile.steamUsername}</small
			>{/if}
		{#if data.profile.discordUsername}<small
				><MessageCircle size={13} /> Discord: {data.profile.discordUsername}</small
			>{/if}
	</div>

	{#if form?.profileError}<p class="error" role="alert">{form.profileError}</p>{/if}
	{#if form?.profileSuccess}<p class="success" role="status">Profile updated.</p>{/if}
	<form method="POST" action="?/profile" enctype="multipart/form-data">
		<label
			>Profile picture <span>(optional, uploaded image overrides Steam)</span><input
				name="avatar"
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
			/></label
		>
		<label class="checkbox-label"
			><input name="useSteamAvatar" type="checkbox" /> Use Steam avatar</label
		>
		<label
			><span class="field-label"
				><Gamepad2 size={14} />Steam profile link <em>(optional, fetches name and avatar)</em></span
			><input
				name="steamProfileUrl"
				type="url"
				inputmode="url"
				placeholder="https://steamcommunity.com/id/..."
				value={data.profile.steamProfileUrl ?? ''}
			/></label
		>
		<label
			><span class="field-label"
				><MessageCircle size={14} />Discord username <em>(optional)</em></span
			><input
				name="discordUsername"
				maxlength="32"
				placeholder="yourname"
				value={data.profile.discordUsername ?? ''}
			/></label
		>
		<label>
			<span class="field-label"
				>Discord user ID <em>(optional, enables direct profile link)</em></span
			>
			<input
				name="discordUserId"
				inputmode="numeric"
				maxlength="20"
				placeholder="123456789012345678"
				value={data.profile.discordUserId ?? ''}
			/>
		</label>
		<label
			>Bio<RichTextEditor
				name="bio"
				value={data.profile.bio}
				placeholder="Tell the hall about yourself..."
			/></label
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
		gap: 0.25rem;
		margin-bottom: 1.25rem;
	}

	.profile-avatar {
		width: 4.5rem;
		height: 4.5rem;
		margin-bottom: 0.35rem;
		border: 1px solid var(--brass-600);
		object-fit: cover;
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
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--brass-400);
		font-size: 0.65rem;
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.field-label :global(svg) {
		color: var(--brass-400);
	}

	.field-label em {
		color: var(--text-muted);
		font-family: var(--body);
		font-size: 0.55rem;
		font-style: normal;
		text-transform: none;
	}

	form,
	label {
		display: grid;
		gap: 0.55rem;
	}

	form {
		gap: 0.85rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.checkbox-label input {
		width: 1rem;
		height: 1rem;
	}

	label,
	h3 {
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.62rem;
		text-transform: uppercase;
	}

	input {
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
