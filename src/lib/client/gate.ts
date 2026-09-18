export const gateStorageKey = 'wolves-of-ragnarok:gate-open:v1';
export const gateOpenedClass = 'gate-already-open';

export function hasOpenedGate(): boolean {
	try {
		if (window.localStorage.getItem(gateStorageKey) === 'true') return true;
		if (window.sessionStorage.getItem(gateStorageKey) === 'true') {
			rememberOpenedGate();
			return true;
		}
	} catch {
		return false;
	}

	return false;
}

export function rememberOpenedGate(): void {
	try {
		window.localStorage.setItem(gateStorageKey, 'true');
	} catch {
		// Private mode can still skip the gate for this document.
	}

	document.documentElement.classList.add(gateOpenedClass);
}
