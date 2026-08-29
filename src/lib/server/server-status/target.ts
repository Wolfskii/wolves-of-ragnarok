import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

function isPrivateIpv4(address: string): boolean {
	const octets = address.split('.').map(Number);
	return (
		octets[0] === 10 ||
		octets[0] === 127 ||
		(octets[0] === 169 && octets[1] === 254) ||
		(octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
		(octets[0] === 192 && octets[1] === 168) ||
		octets[0] === 0
	);
}

function isPrivateAddress(address: string): boolean {
	if (isIP(address) === 4) return isPrivateIpv4(address);
	const normalized = address.toLowerCase();
	return (
		normalized === '::1' ||
		normalized.startsWith('fc') ||
		normalized.startsWith('fd') ||
		normalized.startsWith('fe80:')
	);
}

export async function assertSafeQueryTarget(host: string, allowPrivate: boolean): Promise<string> {
	const result = await lookup(host, { all: true, verbatim: true });
	if (result.length === 0) throw new Error('UNREACHABLE');
	if (!allowPrivate && result.some(({ address }) => isPrivateAddress(address))) {
		throw new Error('UNSAFE_TARGET');
	}

	return result[0]!.address;
}
