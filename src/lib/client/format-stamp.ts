export function formatDayMonth(unixMs: number): string {
	const date = new Date(unixMs);
	return `${date.getDate()}/${date.getMonth() + 1}`;
}

export function formatClock(unixMs: number): string {
	return new Date(unixMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDayMonthClock(unixMs: number): string {
	return `${formatDayMonth(unixMs)} ${formatClock(unixMs)}`;
}
