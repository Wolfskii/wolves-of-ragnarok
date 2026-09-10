<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { DoorOpen, FastForward, Volume2, VolumeX } from '@lucide/svelte';

	const bypassKey = 'wolves-of-ragnarok:intro-bypass:v1';

	type GateStage = 'checking' | 'ready' | 'opening' | 'revealed';

	let {
		children,
		onReveal
	}: {
		children: Snippet;
		onReveal?: () => void;
	} = $props();

	let stage = $state<GateStage>('checking');
	let muted = $state(false);
	let reducedMotion = $state(false);
	let audio: HTMLAudioElement;
	let revealTimer: number | undefined;

	function finishReveal() {
		stage = 'revealed';
		onReveal?.();
	}

	function openGate() {
		if (stage !== 'ready') return;

		stage = 'opening';
		void audio?.play().catch(() => undefined);

		if (reducedMotion) {
			finishReveal();
			return;
		}

		revealTimer = window.setTimeout(finishReveal, 1450);
	}

	function skipGate() {
		window.localStorage.setItem(bypassKey, 'true');
		audio?.pause();
		finishReveal();
	}

	function replayGate() {
		window.localStorage.removeItem(bypassKey);
		stage = 'ready';
		if (audio) audio.currentTime = 0;
	}

	function toggleAudio() {
		muted = !muted;
		if (audio) audio.muted = muted;
		if (!muted && stage !== 'revealed') void audio?.play().catch(() => undefined);
	}

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = motionQuery.matches;
		stage = window.localStorage.getItem(bypassKey) === 'true' ? 'revealed' : 'ready';

		const handleReplay = () => replayGate();
		window.addEventListener('wolves:replay-intro', handleReplay);

		return () => {
			window.removeEventListener('wolves:replay-intro', handleReplay);
			if (revealTimer) window.clearTimeout(revealTimer);
			audio?.pause();
		};
	});
</script>

{@render children()}

<audio bind:this={audio} src="/media/warheim/valhalla-gate.mp3" loop preload="metadata"></audio>

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
					<span>Enter the hall</span>
				</button>
			{:else}
				<p class="opening-label">The doors remember your name.</p>
			{/if}

			<div class="gate-actions">
				<button class="quiet-button" type="button" onclick={skipGate}>
					<FastForward size={14} aria-hidden="true" />
					<span>Skip intro</span>
				</button>
				<button
					class="quiet-button"
					type="button"
					onclick={toggleAudio}
					aria-label={muted ? 'Play gate music' : 'Mute gate music'}
					title={muted ? 'Play gate music' : 'Mute gate music'}
				>
					{#if muted}<VolumeX size={15} aria-hidden="true" />{:else}<Volume2
							size={15}
							aria-hidden="true"
						/>{/if}
					<span>{muted ? 'Music off' : 'Music on'}</span>
				</button>
			</div>
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
			opacity 700ms ease,
			transform 700ms ease;
	}

	.opening .gate-content {
		opacity: 0;
		transform: translateY(-1.5rem);
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

	.enter-button,
	.quiet-button {
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

	.gate-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.1rem;
	}

	.quiet-button {
		padding: 0.3rem;
		background: transparent;
		color: var(--steel-300);
		font-size: 0.55rem;
	}

	.quiet-button:hover,
	.quiet-button:focus-visible {
		color: var(--frost-100);
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
		transition: opacity 700ms ease;
	}

	.door {
		background-image: url('/media/warheim/valhalla-gates.webp');
		background-repeat: no-repeat;
		background-size: 200% 100%;
		transition: transform 1.4s cubic-bezier(0.76, 0, 0.24, 1);
	}

	.door-left {
		background-position: left center;
		transform-origin: left center;
	}

	.door-right {
		background-position: right center;
		transform-origin: right center;
	}

	.opening .door-left {
		transform: translateX(-100%);
	}

	.opening .door-right {
		transform: translateX(100%);
	}

	@media (max-width: 42rem) {
		.gate-content {
			padding-bottom: 15rem;
		}

		.gate-backdrop {
			background-position: 58% center;
		}

		.gate-actions {
			gap: 0.65rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.gate-content,
		.doors,
		.door {
			transition-duration: 1ms;
		}
	}
</style>
