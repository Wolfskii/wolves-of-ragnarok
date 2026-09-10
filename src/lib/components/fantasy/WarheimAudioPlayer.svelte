<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from '@lucide/svelte';

	const tracks = [
		{ title: "The Reaper's Call", src: '/media/deathborn/the-reapers-call.mp3' },
		{ title: 'The Light of the Living', src: '/media/deathborn/the-light-of-the-living.mp3' },
		{
			title: 'The Shadow of the Forgotten',
			src: '/media/deathborn/the-shadow-of-the-forgotten.mp3'
		},
		{ title: 'Raid I', src: '/media/warheim/playlist/raid-i.ogg' },
		{ title: 'Raid II', src: '/media/warheim/playlist/raid-ii.ogg' },
		{ title: 'Raid III', src: '/media/warheim/playlist/raid-iii.ogg' },
		{ title: 'Raid IV', src: '/media/warheim/playlist/raid-iv.ogg' },
		{ title: 'Raid V', src: '/media/warheim/playlist/raid-v.ogg' },
		{ title: 'Raid Boss', src: '/media/warheim/playlist/raid-boss.ogg' },
		{ title: 'Raid Easy', src: '/media/warheim/playlist/raid-easy.ogg' },
		{ title: 'Raid Hard', src: '/media/warheim/playlist/raid-hard.ogg' },
		{ title: 'Raid Medium', src: '/media/warheim/playlist/raid-medium.ogg' },
		{ title: 'Raid Test', src: '/media/warheim/playlist/raid-test.ogg' }
	] as const;

	let audio: HTMLAudioElement;
	let trackIndex = $state(0);
	let playing = $state(false);
	let muted = $state(false);

	function play() {
		void audio
			?.play()
			.then(() => (playing = true))
			.catch(() => (playing = false));
	}

	function pause() {
		audio?.pause();
		playing = false;
	}

	function togglePlayback() {
		if (playing) pause();
		else play();
	}

	function changeTrack(direction: number) {
		trackIndex = (trackIndex + direction + tracks.length) % tracks.length;
		if (audio) {
			audio.src = tracks[trackIndex].src;
			audio.load();
			play();
		}
	}

	function toggleMute() {
		muted = !muted;
		if (audio) audio.muted = muted;
	}

	onMount(() => {
		if (!audio) return;
		audio.volume = 0.2;
		audio.muted = muted;
		audio.addEventListener('ended', () => changeTrack(1));
		const handleGateOpen = () => play();
		window.addEventListener('wolves:gate-open', handleGateOpen);
		play();

		return () => {
			window.removeEventListener('wolves:gate-open', handleGateOpen);
			audio.pause();
		};
	});
</script>

<div class="radio-player" aria-label="Wolves of Ragnarok radio">
	<div class="radio-label">
		<span class="signal" aria-hidden="true"></span>
		<span>RUNE AUDIO · {String(trackIndex + 1).padStart(2, '0')}</span>
	</div>
	<div class="track-status" aria-live="polite">
		<small>Now playing</small>
		<strong title={tracks[trackIndex].title}>{tracks[trackIndex].title}</strong>
	</div>
	<div class="player-controls">
		<button
			type="button"
			onclick={() => changeTrack(-1)}
			aria-label="Previous track"
			title="Previous track"
		>
			<ChevronLeft size={14} aria-hidden="true" />
		</button>
		<button
			class="play-button"
			type="button"
			onclick={togglePlayback}
			aria-label={playing ? 'Pause radio' : 'Play radio'}
			title={playing ? 'Pause radio' : 'Play radio'}
		>
			{#if playing}<Pause size={14} fill="currentColor" aria-hidden="true" />{:else}<Play
					size={14}
					fill="currentColor"
					aria-hidden="true"
				/>{/if}
		</button>
		<button type="button" onclick={() => changeTrack(1)} aria-label="Next track" title="Next track">
			<ChevronRight size={14} aria-hidden="true" />
		</button>
		<button
			type="button"
			onclick={toggleMute}
			aria-label={muted ? 'Unmute radio' : 'Mute radio'}
			title={muted ? 'Unmute radio' : 'Mute radio'}
		>
			{#if muted}<VolumeX size={14} aria-hidden="true" />{:else}<Volume2
					size={14}
					aria-hidden="true"
				/>{/if}
		</button>
	</div>
</div>
<audio bind:this={audio} src={tracks[0].src} preload="auto" autoplay></audio>

<style>
	.radio-player {
		display: grid;
		grid-template-columns: auto minmax(7rem, 1fr) auto;
		align-items: center;
		min-width: 17rem;
		height: 2.35rem;
		border: 1px solid rgba(126, 132, 119, 0.35);
		background: rgba(8, 10, 9, 0.9);
		box-shadow: inset 0 0 18px rgba(197, 174, 112, 0.06);
	}

	.radio-label,
	.track-status,
	.player-controls {
		display: flex;
		align-items: center;
	}

	.radio-label {
		gap: 0.45rem;
		padding: 0 0.7rem;
		border-right: 1px solid rgba(126, 132, 119, 0.25);
		color: var(--brass-400);
		font-family: var(--display);
		font-size: 0.53rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.signal {
		width: 0.38rem;
		height: 0.38rem;
		border-radius: 50%;
		background: var(--rune-300);
		box-shadow: 0 0 8px var(--rune-400);
	}

	.track-status {
		width: 7.5rem;
		min-width: 7.5rem;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.05rem;
		padding: 0 0.75rem;
	}

	.track-status small {
		color: var(--text-muted);
		font-size: 0.47rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.track-status strong {
		overflow: hidden;
		width: 7rem;
		max-width: 7rem;
		color: var(--frost-100);
		font-family: var(--display);
		font-size: 0.58rem;
		font-weight: 600;
		text-overflow: ellipsis;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.player-controls {
		gap: 0.05rem;
		padding-right: 0.35rem;
	}

	button {
		display: grid;
		place-items: center;
		width: 1.65rem;
		height: 1.65rem;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--steel-300);
		cursor: pointer;
	}

	button:hover,
	button:focus-visible {
		color: var(--rune-300);
	}

	.play-button {
		border: 1px solid rgba(168, 59, 67, 0.72);
		background: rgba(104, 31, 41, 0.48);
		color: var(--frost-100);
	}

	audio {
		display: none;
	}

	@media (max-width: 62rem) {
		.radio-player {
			min-width: 14rem;
		}

		.radio-label {
			display: none;
		}

		.track-status {
			width: 7rem;
			min-width: 7rem;
		}

		.track-status strong {
			width: 6.5rem;
			max-width: 6.5rem;
		}
	}

	@media (max-width: 47.99rem) {
		.radio-player {
			width: min(100%, 19rem);
			margin: 0.5rem auto 0;
		}
	}
</style>
