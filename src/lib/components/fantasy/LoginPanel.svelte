<script lang="ts">
	import { LogIn, UserPlus } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let { error, email = '' }: { error?: string; email?: string } = $props();
</script>

<section class="login-shrine" aria-labelledby="login-heading">
	<img
		class="guardian"
		src="/images/creatures/login-wolf-guardian.webp"
		alt=""
		width="1024"
		height="1024"
		aria-hidden="true"
	/>
	<div class="login-slab">
		<p class="rune" aria-hidden="true">ᛉ ᛟ ᚱ</p>
		<h2 id="login-heading">Enter the Hall</h2>
		<p class="intro">Known wolves may pass beneath the old runes.</p>

		{#if error}<p class="error" role="alert">{error}</p>{/if}

		<form method="POST" action="?/login">
			<label for="email">Email</label>
			<input id="email" name="email" type="email" autocomplete="email" value={email} required />

			<label for="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>

			<button type="submit"><LogIn size={17} aria-hidden="true" />Enter</button>
		</form>

		<a class="register" href={resolve('/register')}
			><UserPlus size={15} aria-hidden="true" />Join the pack</a
		>
	</div>
</section>

<style>
	.login-shrine {
		position: relative;
		padding-top: 7rem;
	}

	.guardian {
		position: absolute;
		z-index: 2;
		top: -4.4rem;
		left: 50%;
		width: 15rem;
		height: auto;
		max-width: none;
		transform: translateX(-50%);
		filter: drop-shadow(0 0 16px rgba(87, 215, 206, 0.24)) drop-shadow(0 20px 18px #000);
		pointer-events: none;
	}

	.login-slab {
		position: relative;
		z-index: 3;
		padding: 5.8rem 1.2rem 1.2rem;
		border: 1px solid rgba(137, 115, 69, 0.56);
		background:
			linear-gradient(180deg, rgba(8, 17, 20, 0.72), rgba(3, 8, 10, 0.96)),
			repeating-linear-gradient(90deg, transparent 0 5px, rgba(255, 255, 255, 0.01) 5px 6px);
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
			inset 0 0 28px rgba(87, 215, 206, 0.08),
			var(--shadow-deep);
	}

	.rune {
		margin: 0 0 0.25rem;
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.68rem;
		text-align: center;
		letter-spacing: 0.32em;
	}

	h2 {
		margin: 0;
		color: var(--frost-100);
		font-size: 1.05rem;
		text-align: center;
		text-transform: uppercase;
	}

	.intro {
		margin: 0.4rem 0 1rem;
		color: var(--text-muted);
		font-size: 0.67rem;
		line-height: 1.55;
		text-align: center;
	}

	.error {
		margin: 0 0 0.75rem;
		padding: 0.55rem;
		border-left: 2px solid var(--danger-400);
		background: rgba(101, 27, 19, 0.24);
		color: #f1b1a5;
		font-size: 0.65rem;
		line-height: 1.5;
	}

	form {
		display: grid;
		gap: 0.4rem;
	}

	label {
		color: var(--steel-300);
		font-family: var(--display);
		font-size: 0.58rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	input {
		width: 100%;
		height: 2.35rem;
		margin-bottom: 0.35rem;
		border: 1px solid rgba(111, 133, 140, 0.45);
		border-radius: 0;
		background: rgba(0, 3, 4, 0.8);
		box-shadow: inset 0 1px 8px #000;
		color: var(--frost-100);
		padding-inline: 0.65rem;
	}

	input:focus {
		border-color: var(--rune-400);
	}

	button,
	.register {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		min-height: 2.5rem;
		font-family: var(--display);
		font-size: 0.65rem;
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
	}

	button {
		margin-top: 0.35rem;
		border: 1px solid var(--brass-600);
		border-radius: 0;
		background: linear-gradient(180deg, #334347, #11191c 55%, #1c292c);
		box-shadow:
			inset 0 1px rgba(255, 255, 255, 0.13),
			0 0 12px rgba(87, 215, 206, 0.12);
		color: var(--frost-100);
		cursor: pointer;
	}

	button:hover {
		border-color: var(--rune-400);
		box-shadow:
			inset 0 1px rgba(255, 255, 255, 0.16),
			var(--glow-rune);
	}

	.register {
		margin-top: 0.65rem;
		color: var(--text-muted);
	}

	@media (max-width: 47.99rem) {
		.login-shrine {
			width: min(100%, 24rem);
			margin-inline: auto;
			padding-top: 6rem;
		}

		.guardian {
			top: -4.8rem;
			width: 14rem;
		}
	}
</style>
