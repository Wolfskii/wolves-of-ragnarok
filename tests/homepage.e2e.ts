import { expect, test } from '@playwright/test';

test('renders the fantasy portal without broken artwork or overflow', async ({
	page
}, testInfo) => {
	await page.setViewportSize({ width: 1920, height: 1080 });
	await page.goto('/');

	await expect(page).toHaveTitle(/Wolves of Ragnarok/);
	await expect(page.getByRole('heading', { level: 1, name: 'Wolves of Ragnarok' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Yggdrasil', exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Map of Yggdrasil' })).toBeVisible();
	await expect(page.locator('.serpent')).toHaveCSS('pointer-events', 'none');
	await expect(page.locator('.shieldmaiden')).toHaveCSS('pointer-events', 'none');
	await expect(page.locator('.brand-title')).toHaveCSS('font-family', /GR Read One/);
	await expect(page.locator('.login-shrine .guardian')).toHaveCount(0);
	await expect(page.locator('.brand-title')).toHaveCSS('text-shadow', /168, 59, 67/);
	const discordLinks = page.getByRole('link', { name: 'Discord' });
	await expect(discordLinks).toHaveCount(2);
	for (const link of await discordLinks.all()) {
		await expect(link).toHaveAttribute('href', 'https://discord.gg/CbjgD7WVfp');
	}
	await page.locator('footer').scrollIntoViewIfNeeded();
	await page.waitForFunction(() =>
		[...document.images].every((image) => image.complete && image.naturalWidth > 0)
	);

	const brokenImages = await page.locator('img').evaluateAll((images) =>
		images
			.map((image) => image as HTMLImageElement)
			.filter((image) => !image.complete || image.naturalWidth === 0)
			.map((image) => image.getAttribute('src'))
	);
	expect(brokenImages).toEqual([]);

	const hasHorizontalOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
	expect(hasHorizontalOverflow).toBe(false);

	await page.screenshot({ path: testInfo.outputPath('homepage-desktop.png'), fullPage: true });
});

test('stacks the portal and exposes mobile navigation', async ({ page }, testInfo) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const menu = page.getByRole('button', { name: 'Hall menu' });
	await expect(menu).toBeVisible();
	await menu.click();
	await expect(page.getByRole('link', { name: 'Servers', exact: true })).toBeVisible();

	const hasHorizontalOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
	expect(hasHorizontalOverflow).toBe(false);

	await page.screenshot({ path: testInfo.outputPath('homepage-mobile.png'), fullPage: true });
});

test('shows the map-only live world chart on the servers page', async ({
	page,
	context
}, testInfo) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/servers');

	const liveMap = page.getByRole('region', { name: /^Interactive world map of / });
	await expect(liveMap).toBeVisible();
	await expect.poll(() => liveMap.locator('.leaflet-tile-loaded').count()).toBeGreaterThan(0);
	await expect(page.locator('iframe')).toHaveCount(0);
	await expect(page.getByText('valheim.webble.se:2456')).toBeVisible();
	await expect(page.getByText('4 / 10 players')).toBeVisible();
	await expect(page.locator('.population strong')).toHaveCount(0);
	await expect(page.getByText('Player names unavailable')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Open live map' })).toHaveCount(0);
	await expect(page.getByText('Reported version')).toBeVisible();
	await expect(page.locator('.health strong')).toHaveText('Live');
	await expect(page.locator('.health strong')).toHaveCSS('color', 'rgb(128, 215, 162)');
	await page.getByRole('button', { name: 'Copy join address' }).click();
	await expect(page.getByRole('button', { name: 'Join address copied' })).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => navigator.clipboard.readText()))
		.toBe('valheim.webble.se:2456');
	await page.screenshot({ path: testInfo.outputPath('servers-live-map.png'), fullPage: true });

	await liveMap.hover();
	await page.mouse.wheel(0, -600);
	const mapPane = liveMap.locator('.leaflet-map-pane');
	const beforeDrag = await mapPane.getAttribute('style');
	const mapBox = await liveMap.boundingBox();
	expect(mapBox).not.toBeNull();
	await page.mouse.move(mapBox!.x + mapBox!.width / 2, mapBox!.y + mapBox!.height / 2);
	await page.mouse.down();
	await page.mouse.move(mapBox!.x + mapBox!.width / 2 + 70, mapBox!.y + mapBox!.height / 2 + 40);
	await page.mouse.up();
	await expect.poll(() => mapPane.getAttribute('style')).not.toBe(beforeDrag);

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(liveMap).toBeVisible();
	const hasHorizontalOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
	expect(hasHorizontalOverflow).toBe(false);
	await page.screenshot({
		path: testInfo.outputPath('servers-live-map-mobile.png'),
		fullPage: true
	});
});

test('serves public destinations, auth entry, status data, and guards administration', async ({
	page,
	request
}) => {
	const statusResponse = await request.get('/api/servers/featured/status');
	expect(statusResponse.ok()).toBe(true);
	await expect(statusResponse.json()).resolves.toMatchObject({
		name: 'Yggdrasil',
		state: 'online',
		playerCount: 4,
		maxPlayers: 10
	});
	const passwordResponse = await request.post('/api/servers/featured/password');
	expect(passwordResponse.status()).toBe(401);
	expect(passwordResponse.headers()['cache-control']).toContain('no-store');

	for (const path of [
		'/news',
		'/community',
		'/servers',
		'/members',
		'/about',
		'/rules',
		'/register'
	]) {
		const response = await request.get(path);
		expect(response.status(), `${path} should resolve`).toBe(200);
	}

	await page.goto('/news');
	await expect(page.getByRole('heading', { name: 'Latest Chronicles' })).toBeVisible();
	await page.goto('/members');
	await expect(page.getByRole('heading', { name: 'Guild Roster' })).toBeVisible();
	await page.goto('/about');
	await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
	await page.goto('/community/welcome-to-the-longhouse');
	await expect(page.getByRole('heading', { name: 'Sign in to read this thread' })).toBeVisible();
	await expect(page.locator('.post-body')).toHaveCount(0);

	await page.goto('/admin');
	await expect(page).toHaveURL('/');
	await page.goto('/servers');
	await expect(page.getByRole('button', { name: 'Reveal server password' })).toHaveCount(0);
	await page.goto('/register');
	await expect(page.getByRole('heading', { name: 'Join the Guild' })).toBeVisible();
});
