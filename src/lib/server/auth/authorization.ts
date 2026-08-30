import type { SessionUser } from './session';

export function canPublishNews(user: SessionUser | null): boolean {
	return user?.role === 'ADMIN' || user?.role === 'PUBLISHER';
}
