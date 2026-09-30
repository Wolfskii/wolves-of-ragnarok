import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const enginesDir = path.dirname(createRequire(import.meta.url).resolve('@prisma/engines/package.json'));
const enginesRequire = createRequire(path.join(enginesDir, 'package.json'));
const { enginesVersion } = enginesRequire('@prisma/engines-version');
const { download, BinaryType } = enginesRequire('@prisma/fetch-engine');

// @prisma/engines postinstall uses failSilent and hides download errors.
// prisma generate still succeeds, then migrate deploy exits 1 at runtime.
const binaryPaths = await download({
	binaries: { [BinaryType.SchemaEngineBinary]: enginesDir },
	version: enginesVersion,
	showProgress: true,
	failSilent: false
});

const enginePath = Object.values(binaryPaths['schema-engine'] ?? {})[0];
if (!enginePath) {
	console.error('Prisma schema engine download did not return a binary path.');
	process.exit(1);
}

const result = spawnSync(enginePath, ['--version'], { encoding: 'utf8' });
if (result.error) {
	console.error(result.error);
	process.exit(1);
}
if (result.status !== 0) {
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
	console.error(`Prisma schema engine exited ${result.status}.`);
	process.exit(result.status ?? 1);
}

console.log(result.stdout.trim());
