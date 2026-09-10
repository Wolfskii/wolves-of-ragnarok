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

let audio: HTMLAudioElement | null = null;
let trackIndex = 0;
let muted = false;
const listeners = new Set<RadioListener>();

function notify() {
	for (const listener of listeners) listener();
}

function ensureAudio(): HTMLAudioElement | null {
	if (typeof document === 'undefined') return null;
	if (audio) return audio;

	audio = document.createElement('audio');
	audio.preload = 'auto';
	audio.autoplay = true;
	audio.volume = 0.2;
	audio.muted = muted;
	audio.src = radioTracks[trackIndex].src;
	audio.addEventListener('ended', () => nextTrack());
	document.body.appendChild(audio);
	return audio;
}

export function subscribeRadio(listener: RadioListener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function getRadioState() {
	return {
		trackIndex,
		playing: Boolean(audio && !audio.paused),
		muted
	};
}

export function playRadio() {
	const player = ensureAudio();
	if (!player) return;
	void player.play().then(notify).catch(notify);
}

export function initializeRadio() {
	const wasInitialized = Boolean(audio);
	ensureAudio();
	if (!wasInitialized) playRadio();
	notify();
}

export function pauseRadio() {
	ensureAudio()?.pause();
	notify();
}

export function toggleRadio() {
	if (getRadioState().playing) pauseRadio();
	else playRadio();
}

export function changeRadioTrack(direction: number) {
	trackIndex = (trackIndex + direction + radioTracks.length) % radioTracks.length;
	const player = ensureAudio();
	if (!player) return;
	player.src = radioTracks[trackIndex].src;
	player.load();
	playRadio();
	notify();
}

export function nextTrack() {
	changeRadioTrack(1);
}

export function toggleRadioMute() {
	muted = !muted;
	const player = ensureAudio();
	if (player) player.muted = muted;
	notify();
}
