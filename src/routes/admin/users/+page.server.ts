import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/db';

const roleSchema = z.enum(['USER', 'MODERATOR', 'PUBLISHER', 'ADMIN']);

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'ADMIN') error(403, 'Only administrators can assign roles.');
	return {
		users: await getDatabase().user.findMany({
			orderBy: { createdAt: 'asc' },
			select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true }
		})
	};
};

export const actions = {
	setRole: async ({ request, locals }) => {
		if (locals.user?.role !== 'ADMIN')
			return fail(403, { usersError: 'Only administrators can assign roles.' });
		const formData = await request.formData();
		const userId = z.string().uuid().safeParse(formData.get('userId'));
		const role = roleSchema.safeParse(formData.get('role'));
		if (!userId.success || !role.success)
			return fail(400, { usersError: 'Choose a valid member and role.' });
		if (userId.data === locals.user.id && role.data !== 'ADMIN') {
			return fail(400, { usersError: 'You cannot remove your own administrator role.' });
		}
		if (role.data !== 'ADMIN') {
			const adminCount = await getDatabase().user.count({
				where: { role: 'ADMIN', isActive: true }
			});
			const target = await getDatabase().user.findUnique({
				where: { id: userId.data },
				select: { role: true }
			});
			if (target?.role === 'ADMIN' && adminCount <= 1) {
				return fail(400, { usersError: 'Keep at least one active administrator.' });
			}
		}
		await getDatabase().user.update({ where: { id: userId.data }, data: { role: role.data } });
		return { usersSuccess: true };
	}
} satisfies Actions;
