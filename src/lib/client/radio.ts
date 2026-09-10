export const radioTracks = [
	{ title: "The Reaper's Call", src: '/media/deathborn/the-reapers-call.mp3' },
	{ title: 'The Light of the Living', src: '/media/deathborn/the-light-of-the-living.mp3' },
	{ title: 'The Shadow of the Forgotten', src: '/media/deathborn/the-shadow-of-the-forgotten.mp3' },
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

type RadioListener = () => void;
type RadioPreference = { playing: boolean; muted: boolean };

let audio: HTMLAudioElement | null = null;
let trackIndex = 0;
let muted = false;
let stoppedByUser = false;
let preferenceLoaded = false;
let shuffledTracks: readonly RadioTrack[] | null = null;
const listeners = new Set<RadioListener>();
const preferenceKey = 'wolves-of-ragnarok-radio';

type RadioTrack = (typeof radioTracks)[number];

function createShuffledPlaylist(): readonly RadioTrack[] {
	const playlist = [...radioTracks];
	for (let index = playlist.length - 1; index > 0; index -= 1) {
		const random = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
		const swapIndex = Math.floor(random * (index + 1));
		[playlist[index], playlist[swapIndex]] = [playlist[swapIndex], playlist[index]];
	}
	return playlist;
}

function notify() {
	for (const listener of listeners) listener();
}

function loadPreference() {
	if (preferenceLoaded || typeof localStorage === 'undefined') return;
	preferenceLoaded = true;
	try {
		const stored = localStorage.getItem(preferenceKey);
		if (!stored) return;
		const preference = JSON.parse(stored) as Partial<RadioPreference>;
		muted = preference.muted === true;
		stoppedByUser = preference.playing === false;
	} catch {
		preferenceLoaded = true;
	}
}

function savePreference() {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(
			preferenceKey,
			JSON.stringify({ playing: !stoppedByUser, muted } satisfies RadioPreference)
		);
	} catch {
		return;
	}
}

function ensureAudio(): HTMLAudioElement | null {
	if (typeof document === 'undefined') return null;
	loadPreference();
	if (audio) return audio;
	shuffledTracks ??= createShuffledPlaylist();

	audio = document.createElement('audio');
	audio.preload = 'auto';
	audio.autoplay = !stoppedByUser;
	audio.volume = 0.2;
	audio.muted = muted;
	audio.src = shuffledTracks[trackIndex].src;
	audio.addEventListener('ended', () => nextTrack());
	document.body.appendChild(audio);
	return audio;
}

export function subscribeRadio(listener: RadioListener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getRadioState() {
	loadPreference();
	return {
		trackIndex,
		playing: Boolean(audio && !audio.paused),
		muted
	};
}

export function getRadioPlaylist() {
	ensureAudio();
	return shuffledTracks ?? radioTracks;
}

export function playRadio() {
	loadPreference();
	stoppedByUser = false;
	savePreference();
	const player = ensureAudio();
	if (!player) return;
	void player.play().then(notify).catch(notify);
}

export function initializeRadio() {
	loadPreference();
	const wasInitialized = Boolean(audio);
	ensureAudio();
	if (!wasInitialized && !stoppedByUser) playRadio();
	notify();
}

export function pauseRadio() {
	stoppedByUser = true;
	savePreference();
	ensureAudio()?.pause();
	notify();
}

export function toggleRadio() {
	if (getRadioState().playing) pauseRadio();
	else playRadio();
}

export function changeRadioTrack(direction: number) {
	const playlist = getRadioPlaylist();
	trackIndex = (trackIndex + direction + playlist.length) % playlist.length;
	const player = ensureAudio();
	if (!player) return;
	player.src = playlist[trackIndex].src;
	player.load();
	playRadio();
	notify();
}

export function nextTrack() {
	changeRadioTrack(1);
}

export function toggleRadioMute() {
	loadPreference();
	muted = !muted;
	savePreference();
	const player = ensureAudio();
	if (player) player.muted = muted;
	notify();
}

export function shouldAutoPlayRadio() {
	loadPreference();
	return !stoppedByUser;
}
