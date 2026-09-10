<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { ArrowRight, Check, Copy, Eye, EyeOff } from '@lucide/svelte';
	import type { ServerStatusResult } from '$lib/server/server-status/types';

	let {
		name = 'Yggdrasil',
		online = true,
		ping = null,
		joinAddress = 'valheim.webble.se',
		joinPort = 2456,
		worldName = 'Yggdrasil',
		day = null,
		version = null,
		snapshotAgeMs = null,
		queriedAt = null,
		detailed = false,
		canRevealPassword = false,
		showInfoLink = false
	}: {
		name?: string;
		online?: boolean;
		ping?: number | null;
		joinAddress?: string;
		joinPort?: number;
		worldName?: string | null;
		day?: number | null;
		version?: string | null;
		snapshotAgeMs?: number | null;
		queriedAt?: string | null;
		detailed?: boolean;
		canRevealPassword?: boolean;
		showInfoLink?: boolean;
	} = $props();

	let current = $state({
		name: 'Yggdrasil',
		online: true,
		ping: null as number | null,
		joinAddress: 'valheim.webble.se',
		joinPort: 2456,
		worldName: 'Yggdrasil' as string | null,
		day: null as number | null,
		version: null as string | null,
		snapshotAgeMs: null as number | null,
		queriedAt: null as string | null
	});
	let receivedLiveStatus = $state(false);
	let serverPassword = $state('');
	let passwordVisible = $state(false);
	let passwordLoading = $state(false);
	let passwordError = $state('');
	let passwordCopied = $state(false);
	let addressCopied = $state(false);
	let copyResetTimer: number | undefined;
	let passwordCopyResetTimer: number | undefined;

	async function copyJoinAddress() {
		await navigator.clipboard.writeText(current.joinAddress);
		addressCopied = true;
		if (copyResetTimer) window.clearTimeout(copyResetTimer);
		copyResetTimer = window.setTimeout(() => {
			addressCopied = false;
		}, 2000);
	}

	async function loadServerPassword(): Promise<string | null> {
		if (serverPassword) return serverPassword;
		passwordLoading = true;
		passwordError = '';
		try {
			const response = await fetch('/api/servers/featured/password', { method: 'POST' });
			const result = (await response.json()) as { password?: string; error?: string };
			if (!response.ok || !result.password) {
				passwordError = result.error ?? 'The server password could not be loaded.';
				return null;
			}
			serverPassword = result.password;
			return result.password;
		} catch {
			passwordError = 'The server password could not be loaded.';
			return null;
		} finally {
			passwordLoading = false;
		}
	}

	async function togglePassword() {
		const password = await loadServerPassword();
		if (password) passwordVisible = !passwordVisible;
	}

	async function copyServerPassword() {
		const password = await loadServerPassword();
		if (!password) return;

		try {
			await navigator.clipboard.writeText(password);
			passwordCopied = true;
			if (passwordCopyResetTimer) window.clearTimeout(passwordCopyResetTimer);
			passwordCopyResetTimer = window.setTimeout(() => {
				passwordCopied = false;
			}, 2000);
		} catch {
			passwordError = 'The server password could not be copied.';
		}
	}

	$effect(() => {
		if (!receivedLiveStatus)
			current = {
				name,
				online,
				ping,
				joinAddress,
				joinPort,
				worldName,
				day,
				version,
				snapshotAgeMs,
				queriedAt
			};
	});

	onMount(() => {
		let active = true;
		const refresh = async () => {
			try {
				const response = await fetch('/api/servers/featured/status');
				if (!response.ok) return;
				const result = (await response.json()) as ServerStatusResult;
				if (!active) return;
				receivedLiveStatus = true;
				current = {
					name: result.name,
					online: result.state === 'online',
					ping: result.pingMs,
					joinAddress: result.joinAddress,
					joinPort: result.joinPort,
					worldName: result.worldName,
					day: result.day,
					version: result.version,
					snapshotAgeMs: result.snapshotAgeMs,
					queriedAt: result.queriedAt
				};
			} catch {
				// Retain the last known state when a refresh cannot reach the backend.
			}
		};

		void refresh();
		const timer = window.setInterval(refresh, 30_000);
		return () => {
			active = false;
			window.clearInterval(timer);
			if (copyResetTimer) window.clearTimeout(copyResetTimer);
			if (passwordCopyResetTimer) window.clearTimeout(passwordCopyResetTimer);
		};
	});
</script>

<section class="status-card" aria-labelledby="server-name">
	<div class="shield-wrap" aria-hidden="true">
		<img src="/images/ui/server-shield.webp" alt="" width="1024" height="1024" />
		<span class:offline={!current.online}></span>
	</div>

	<div class="status-slab">
		<p class="game">Valheim</p>
		<h2 id="server-name">{current.name}</h2>
		{#if current.worldName || current.day !== null}
			<p class="world-details">
				{current.worldName ?? 'Valheim world'}{current.day !== null ? ` · Day ${current.day}` : ''}
			</p>
		{/if}
		<p class="state" class:offline={!current.online}>
			<span aria-hidden="true"></span>{current.online ? 'Online' : 'Offline'}
		</p>

		{#if detailed}
			<dl class="server-facts">
				<div>
					<dt>World</dt>
					<dd>{current.worldName ?? 'Unavailable'}</dd>
				</div>
				<div>
					<dt>Snapshot age</dt>
					<dd>
						{current.snapshotAgeMs === null
							? 'Unavailable'
							: `${Math.round(current.snapshotAgeMs / 1000)}s`}
					</dd>
				</div>
				<div>
					<dt>Last checked</dt>
					<dd>
						{current.queriedAt ? new Date(current.queriedAt).toLocaleTimeString() : 'Waiting'}
					</dd>
				</div>
				{#if current.ping !== null}
					<div>
						<dt>Query latency</dt>
						<dd>{current.ping} ms</dd>
					</div>
				{/if}
			</dl>
		{/if}

		{#if current.joinAddress}
			<div class="join-details">
				<span>Join address</span>
				<div class="join-code-box">
					<code>{current.joinAddress}</code>
					<button
						class="reveal-button"
						type="button"
						onclick={copyJoinAddress}
						aria-label={addressCopied ? 'Join address copied' : 'Copy join address'}
						title={addressCopied ? 'Copied' : 'Copy join address'}
					>
						{#if addressCopied}<Check size={15} />{:else}<Copy size={15} />{/if}
					</button>
				</div>
			</div>
		{/if}

		{#if showInfoLink}
			<a class="server-info-link" href={resolve('/servers')}>
				<span>Server information &amp; password</span><ArrowRight size={14} aria-hidden="true" />
			</a>
		{/if}

		{#if detailed && canRevealPassword}
			<div class="password-details">
				<label for="server-password">Server password</label>
				<div class="password-field">
					<input
						id="server-password"
						type={passwordVisible ? 'text' : 'password'}
						value={serverPassword}
						placeholder="Hidden"
						readonly
					/>
					<button
						type="button"
						onclick={togglePassword}
						disabled={passwordLoading}
						aria-label={serverPassword && passwordVisible
							? 'Hide server password'
							: 'Reveal server password'}
						title={serverPassword && passwordVisible
							? 'Hide server password'
							: 'Reveal server password'}
					>
						{#if passwordVisible}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
					</button>
					<button
						class="copy-button"
						type="button"
						onclick={copyServerPassword}
						disabled={passwordLoading}
						aria-label={passwordCopied ? 'Server password copied' : 'Copy server password'}
						title={passwordCopied ? 'Copied' : 'Copy server password'}
					>
						{#if passwordCopied}<Check size={15} />{:else}<Copy size={15} />{/if}
					</button>
				</div>
				{#if passwordError}<p class="password-error" role="alert">{passwordError}</p>{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	.status-card {
		position: relative;
		padding-top: 5.2rem;
		filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.7));
	}

	.shield-wrap {
		position: absolute;
		z-index: 3;
		top: 0;
		left: 50%;
		width: 9.5rem;
		aspect-ratio: 1;
		transform: translateX(-50%);
		filter: drop-shadow(0 0 16px rgba(168, 59, 67, 0.34));
	}

	.shield-wrap img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.shield-wrap span {
		position: absolute;
		right: 1.05rem;
		bottom: 1.4rem;
		width: 0.78rem;
		aspect-ratio: 1;
		border: 2px solid #d9ffea;
		border-radius: 50%;
		background: var(--success-400);
		box-shadow: 0 0 12px var(--success-400);
	}

	.shield-wrap span.offline {
		background: var(--danger-400);
		box-shadow: 0 0 12px var(--danger-400);
	}

	.status-slab {
		padding: 5rem 1.3rem 1.2rem;
		border: 1px solid rgba(137, 115, 69, 0.62);
		background:
			linear-gradient(135deg, rgba(111, 133, 140, 0.09), transparent 30%),
			repeating-linear-gradient(90deg, transparent 0 5px, rgba(255, 255, 255, 0.009) 5px 6px),
			rgba(4, 10, 13, 0.94);
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
			inset 0 0 24px rgba(111, 133, 140, 0.1),
			var(--shadow-deep);
		text-align: center;
	}

	.game {
		margin: 0;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.18em;
	}

	h2 {
		margin: 0.25rem 0 0.65rem;
		color: var(--frost-100);
		font-size: 1.05rem;
		text-transform: uppercase;
	}

	.world-details {
		margin: -0.35rem 0 0.65rem;
		color: var(--text-muted);
		font-size: 0.68rem;
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 0.85rem;
		color: var(--success-400);
		font-family: var(--display);
		font-size: 0.68rem;
		text-transform: uppercase;
	}

	.state span {
		width: 0.45rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: currentColor;
		box-shadow: 0 0 8px currentColor;
	}

	.state.offline {
		color: var(--danger-400);
	}

	.server-facts {
		display: grid;
		gap: 0.35rem;
		margin: 0.75rem 0 0;
		padding-top: 0.7rem;
		border-top: 1px solid rgba(137, 115, 69, 0.32);
	}

	.server-facts div {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.server-facts dt,
	.server-facts dd {
		margin: 0;
		font-size: 0.62rem;
	}

	.server-facts dt {
		color: var(--text-muted);
	}

	.server-facts dd {
		color: var(--steel-300);
		text-align: right;
	}

	.join-details {
		display: grid;
		gap: 0.25rem;
		margin-top: 0.9rem;
		padding-top: 0.7rem;
		border-top: 1px solid rgba(137, 115, 69, 0.32);
		text-align: left;
	}

	.join-details span {
		color: var(--text-muted);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.join-code-box {
		position: relative;
		height: 2.25rem;
		border: 1px solid rgba(137, 115, 69, 0.48);
		background: rgba(0, 0, 0, 0.38);
	}

	.join-code-box code {
		display: block;
		overflow: hidden;
		padding: 0.62rem 2.65rem 0.62rem 0.55rem;
		color: var(--frost-100);
		font-size: 0.72rem;
		line-height: 1;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.join-code-box button {
		position: absolute;
		top: 0;
		right: 0;
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.2rem;
		border: 0;
		border-left: 1px solid rgba(137, 115, 69, 0.48);
		background: var(--glass-button);
		color: var(--brass-400);
		cursor: pointer;
	}

	.join-code-box button:hover,
	.join-code-box button:focus-visible {
		color: var(--frost-100);
	}

	.server-info-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		margin-top: 0.8rem;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.62rem;
		text-decoration: none;
		text-transform: uppercase;
	}

	.server-info-link:hover,
	.server-info-link:focus-visible {
		color: var(--frost-100);
	}

	.password-details {
		display: grid;
		gap: 0.3rem;
		margin-top: 0.75rem;
		text-align: left;
	}

	.password-details label {
		color: var(--text-muted);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
	}

	.password-field {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 2.25rem 2.25rem;
		height: 2.25rem;
		border: 1px solid rgba(137, 115, 69, 0.48);
		background: rgba(0, 0, 0, 0.38);
	}

	.password-field input {
		min-width: 0;
		border: 0;
		background: transparent;
		color: var(--frost-100);
		font-family: monospace;
		font-size: 0.72rem;
		padding-inline: 0.55rem;
	}

	.password-field button {
		display: grid;
		place-items: center;
		border: 0;
		border-left: 1px solid rgba(137, 115, 69, 0.48);
		background: var(--glass-button);
		color: var(--brass-400);
		cursor: pointer;
	}

	.password-field button:disabled {
		cursor: wait;
		opacity: 0.55;
	}

	.password-field .copy-button {
		border-left-color: rgba(137, 115, 69, 0.3);
	}

	.password-error {
		margin: 0;
		color: var(--danger-400);
		font-size: 0.62rem;
	}

	@media (max-width: 47.99rem) {
		.status-card {
			width: min(100%, 24rem);
			margin-inline: auto;
		}

		.shield-wrap {
			width: 8.5rem;
		}
	}
</style>
