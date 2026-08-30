<script lang="ts">
	import AuthPageShell from '$lib/components/fantasy/AuthPageShell.svelte';
	import { Gamepad2, MessageCircle } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Join the Guild | Wolves of Ragnarok</title></svelte:head>

<AuthPageShell title="Join the Guild" eyebrow="Carve your name into the roster">
	<p class="intro">Create your guild identity. New accounts begin with the rank of member.</p>
	{#if form?.registrationError}<p class="error" role="alert">{form.registrationError}</p>{/if}
	<form method="POST">
		<div class="field-row">
			<label
				>Email<input
					name="email"
					type="email"
					autocomplete="email"
					value={form?.values?.email ?? ''}
					required
				/></label
			>
			<label
				>Username<input
					name="username"
					autocomplete="username"
					value={form?.values?.username ?? ''}
					required
				/></label
			>
		</div>
		<label
			><span class="field-label"
				><Gamepad2 size={14} />Steam profile link <em>(optional, fetches name and avatar)</em></span
			><input
				name="steamProfileUrl"
				type="url"
				inputmode="url"
				placeholder="https://steamcommunity.com/id/..."
				value={form?.values?.steamProfileUrl ?? ''}
			/></label
		>
		<label
			><span class="field-label"
				><MessageCircle size={14} />Discord username <em>(optional)</em></span
			><input
				name="discordUsername"
				maxlength="32"
				placeholder="yourname"
				value={form?.values?.discordUsername ?? ''}
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
				value={form?.values?.discordUserId ?? ''}
			/>
		</label>
		<div class="field-row">
			<label
				>Password<input
					name="password"
					type="password"
					autocomplete="new-password"
					minlength="12"
					required
				/></label
			>
			<label
				>Confirm password<input
					name="confirmPassword"
					type="password"
					autocomplete="new-password"
					minlength="12"
					required
				/></label
			>
		</div>
		<button type="submit">Swear the oath</button>
	</form>
	<p class="login-link">Already known to the hall? <a href={resolve('/')}>Return to login</a></p>
</AuthPageShell>

<style>
	.intro,
	.login-link {
		color: var(--text-muted);
		font-size: 0.76rem;
	}

	.error {
		padding: 0.7rem;
		border-left: 2px solid var(--danger-400);
		background: rgba(101, 27, 19, 0.28);
		color: #f1b1a5;
	}

	form {
		display: grid;
		gap: 0.8rem;
	}

	.field-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
	}

	label {
		display: grid;
		gap: 0.3rem;
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.62rem;
		text-transform: uppercase;
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

	label span {
		color: var(--text-muted);
		font-family: var(--body);
		font-size: 0.55rem;
		text-transform: none;
	}

	input {
		width: 100%;
		height: 2.7rem;
		border: 1px solid rgba(168, 59, 67, 0.42);
		border-radius: 0;
		background: rgba(0, 3, 4, 0.84);
		box-shadow: inset 0 1px 8px #000;
		color: var(--frost-100);
		padding-inline: 0.7rem;
	}

	button {
		min-height: 2.8rem;
		margin-top: 0.4rem;
		border: 1px solid var(--brass-600);
		border-radius: 0;
		background: var(--glass-button);
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.66rem;
		text-transform: uppercase;
		cursor: pointer;
	}

	.login-link {
		margin: 1rem 0 0;
		text-align: center;
	}

	@media (max-width: 35rem) {
		.field-row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
