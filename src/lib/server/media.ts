import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import sharp from 'sharp';
import { getPrivateEnv } from './env';
import { getDatabase } from './db';

const allowedTypes = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp'],
	['image/gif', 'gif']
]);

export async function saveImageUpload(file: File, userId: string, kind: 'IMAGE' | 'AVATAR') {
	const extension = allowedTypes.get(file.type);
	if (!extension) throw new Error('UNSUPPORTED_IMAGE_TYPE');

	const config = getPrivateEnv();
	if (!file.size || file.size > config.MAX_UPLOAD_BYTES) throw new Error('IMAGE_TOO_LARGE');

	const buffer = Buffer.from(await file.arrayBuffer());
	const metadata = await sharp(buffer, { failOn: 'error' }).metadata();
	if (!metadata.width || !metadata.height || metadata.width > 4096 || metadata.height > 4096) {
		throw new Error('IMAGE_DIMENSIONS_INVALID');
	}

	const storagePath = `media/${randomUUID()}.${extension}`;
	const destination = resolve(config.UPLOAD_DIR, storagePath);
	await mkdir(dirname(destination), { recursive: true });
	await writeFile(destination, buffer, { flag: 'wx' });

	try {
		return await getDatabase().media.create({
			data: {
				kind,
				filename: file.name.slice(0, 255) || `upload.${extension}`,
				storagePath,
				mimeType: file.type,
				sizeBytes: buffer.length,
				width: metadata.width,
				height: metadata.height,
				uploadedById: userId
			}
		});
	} catch (error) {
		await unlink(destination).catch(() => undefined);
		throw error;
	}
}

export function mediaFilePath(storagePath: string): string {
	const root = resolve(getPrivateEnv().UPLOAD_DIR);
	const destination = resolve(root, storagePath);
	const pathFromRoot = relative(root, destination);
	if (pathFromRoot.startsWith('..') || isAbsolute(pathFromRoot)) {
		throw new Error('INVALID_MEDIA_PATH');
	}
	return destination;
}

export async function readMedia(id: string) {
	const media = await getDatabase().media.findUnique({
		where: { id },
		select: { storagePath: true, mimeType: true }
	});
	if (!media) return null;
	return { ...media, data: await readFile(mediaFilePath(media.storagePath)) };
}
