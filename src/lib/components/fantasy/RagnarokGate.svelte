<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { DoorOpen } from '@lucide/svelte';

	type GateStage = 'checking' | 'ready' | 'opening' | 'revealed';

	let { children }: { children: Snippet } = $props();

	let stage = $state<GateStage>('checking');
	let reducedMotion = $state(false);
	let audio: HTMLAudioElement;
	let revealTimer: number | undefined;

	function finishReveal() {
		stage = 'revealed';
	}

	function openGate() {
		if (stage !== 'ready') return;

		stage = 'opening';
		void audio?.play().catch(() => undefined);

		if (reducedMotion) {
			finishReveal();
			return;
		}

		revealTimer = window.setTimeout(finishReveal, 2500);
	}

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = motionQuery.matches;
		stage = 'ready';

		return () => {
			if (revealTimer) window.clearTimeout(revealTimer);
			audio?.pause();
		};
	});
</script>

<div class="gate-site-reveal" class:opening={stage === 'opening' || stage === 'revealed'}>
	{@render children()}
</div>

<audio bind:this={audio} src="/media/warheim/valhalla-gate.mp3" preload="auto"></audio>

{#if stage !== 'revealed'}
	<div class="gate" class:opening={stage === 'opening'} aria-label="Wolves of Ragnarok entry gate">
		<div class="gate-backdrop" aria-hidden="true"></div>
		<div class="gate-veil" aria-hidden="true"></div>

		<div class="gate-content">
			<p class="gate-protocol">WOLVES // VALHALLA GATE</p>
			<img
				class="gate-mark"
				src="/images/branding/logo-wolf-light.png"
				alt=""
				width="576"
				height="642"
			/>
			<h1>Wolves of Ragnarok</h1>
			<p class="gate-lede">The pack gathers beyond the threshold.</p>

			{#if stage === 'ready'}
				<button class="enter-button" type="button" onclick={openGate}>
					<DoorOpen size={18} aria-hidden="true" />
					<span>Open the gates</span>
				</button>
			{:else}
				<p class="opening-label">The doors remember your name.</p>
			{/if}
		</div>

		<div class="doors" aria-hidden="true">
			<div class="door door-left"></div>
			<div class="door door-right"></div>
		</div>
	</div>
{/if}

<style>
	:global(body:has(.gate)) {
		overflow: hidden;
	}

	:global(html),
	:global(body) {
		overflow-x: clip;
	}

	audio {
		display: none;
	}

	.gate {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: grid;
		place-items: center;
		overflow: hidden;
		background: #050807;
		isolation: isolate;
	}

	.gate-backdrop,
	.gate-veil,
	.doors {
		position: absolute;
		inset: 0;
	}

	.gate-backdrop {
		z-index: -3;
		background:
			linear-gradient(180deg, rgba(3, 5, 5, 0.1), rgba(3, 5, 5, 0.86)),
			url('/media/warheim/forged-hero.webp') center / cover no-repeat;
		filter: saturate(0.76);
		transform: scale(1.04);
	}

	.gate-veil {
		z-index: -2;
		background:
			radial-gradient(circle at 50% 44%, transparent 0 10rem, rgba(0, 0, 0, 0.58) 42rem),
			linear-gradient(
				90deg,
				rgba(2, 4, 4, 0.74),
				transparent 34%,
				transparent 66%,
				rgba(2, 4, 4, 0.74)
			);
		transition: opacity 1.65s ease;
	}

	.gate-site-reveal {
		position: relative;
		z-index: 0;
		min-height: 100vh;
		opacity: 0;
		filter: brightness(0.42) saturate(1.45) contrast(1.08);
		transform: scale(1.055);
		transform-origin: center;
		transition:
			opacity 2.6s cubic-bezier(0.18, 0.68, 0.2, 1) 0.7s,
			transform 3.8s cubic-bezier(0.16, 0.72, 0.18, 1) 0.45s,
			filter 2.8s ease 0.62s;
	}

	.gate-site-reveal.opening {
		opacity: 1;
		filter: brightness(1) saturate(1) contrast(1);
		transform: scale(1);
	}

	.gate-content {
		position: relative;
		z-index: 4;
		display: grid;
		justify-items: center;
		width: min(calc(100% - 2rem), 42rem);
		padding-bottom: 21rem;
		text-align: center;
		transition:
			opacity 1.25s cubic-bezier(0.22, 0.68, 0.2, 1),
			transform 1.4s cubic-bezier(0.2, 0.7, 0.18, 1),
			filter 1.25s cubic-bezier(0.22, 0.68, 0.2, 1);
	}

	.opening .gate-content {
		opacity: 0;
		filter: blur(8px);
		transform: translateY(-1.5rem) scale(0.94);
	}

	.gate-protocol,
	.gate-lede,
	.opening-label {
		font-family: var(--display);
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	.gate-protocol {
		margin: 0 0 1.1rem;
		color: var(--rune-300);
		font-size: 0.62rem;
	}

	.gate-mark {
		width: clamp(4.5rem, 8vw, 6rem);
		height: auto;
		filter: drop-shadow(0 0 18px rgba(168, 59, 67, 0.55));
	}

	h1 {
		margin: 0.65rem 0 0;
		color: var(--frost-100);
		font-size: clamp(2.1rem, 7vw, 5.2rem);
		text-shadow:
			0 0 24px rgba(168, 59, 67, 0.46),
			0 12px 24px #000;
	}

	.gate-lede {
		margin: 0.85rem 0 1.75rem;
		color: var(--brass-400);
		font-size: clamp(0.58rem, 1.5vw, 0.76rem);
	}

	.enter-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		border: 0;
		font-family: var(--display);
		text-transform: uppercase;
		cursor: pointer;
	}

	.enter-button {
		min-width: 12rem;
		min-height: 3.2rem;
		padding: 0 1.4rem;
		border: 1px solid var(--rune-300);
		background: rgba(8, 12, 12, 0.78);
		box-shadow:
			0 0 24px rgba(168, 59, 67, 0.36),
			inset 0 0 20px rgba(168, 59, 67, 0.12);
		color: var(--frost-100);
		font-size: 0.68rem;
	}

	.enter-button:hover,
	.enter-button:focus-visible {
		background: rgba(168, 59, 67, 0.24);
	}

	.opening-label {
		margin: 0;
		color: var(--brass-400);
		font-size: 0.65rem;
	}

	.doors {
		z-index: 3;
		display: grid;
		grid-template-columns: 1fr 1fr;
		pointer-events: none;
		transition: opacity 1.65s ease;
	}

	.door {
		background-image: url('/media/warheim/valhalla-gates.webp');
		background-repeat: no-repeat;
		background-size: 200% 100%;
		transition:
			transform 2.45s cubic-bezier(0.72, 0.01, 0.18, 1),
			box-shadow 2.45s cubic-bezier(0.72, 0.01, 0.18, 1);
	}

	.door-left {
		background-position: left center;
		transform-origin: center;
	}

	.door-right {
		background-position: right center;
		transform-origin: center;
	}

	.opening .door-left {
		transform: translate3d(-101.5%, 0, 0) skewY(-0.45deg);
		box-shadow:
			58px 0 130px rgba(0, 0, 0, 0.86),
			18px 0 46px rgba(155, 4, 20, 0.24);
	}

	.opening .door-right {
		transform: translate3d(101.5%, 0, 0) skewY(0.45deg);
		box-shadow:
			-58px 0 130px rgba(0, 0, 0, 0.86),
			-18px 0 46px rgba(155, 4, 20, 0.24);
	}

	.opening .gate-veil,
	.opening .doors {
		opacity: 0;
	}

	@media (max-width: 42rem) {
		.gate-content {
			padding-bottom: 15rem;
		}

		.gate-backdrop {
			background-position: 58% center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gate-content,
		.gate-site-reveal,
		.doors,
		.door {
			transition-duration: 1ms !important;
		}
	}
</style>
