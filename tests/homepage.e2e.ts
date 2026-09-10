import { expect, test, type Page } from '@playwright/test';

async function enterThroughGate(page: Page) {
	await page.goto('/');
	await page.getByRole('button', { name: 'Open the gates' }).click();
	await expect(page.locator('.gate')).toHaveCount(0);
}

test('opens the Wolves gate with its one-shot opening sound', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/');

	await expect(page.getByRole('button', { name: 'Open the gates' })).toBeVisible();
	await page.mouse.wheel(0, 1200);
	await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
	await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0);
	await expect(page.getByText('Music on')).toHaveCount(0);
	await page.getByRole('button', { name: 'Open the gates' }).click();
	await expect(page.getByRole('button', { name: 'Pause radio' })).toBeVisible();
	await expect(page.locator('.track-status strong')).toBeVisible();
	await expect(page.locator('.door-left')).toHaveCSS('opacity', '1');
	await expect(page.locator('.door-right')).toHaveCSS('opacity', '1');
	await expect(page.locator('.gate')).toHaveCount(0);
	await expect(page.locator('.gate-site-reveal')).toHaveClass(/fully-open/);
	await page.reload();
	await expect(page.getByRole('button', { name: 'Open the gates' })).toHaveCount(0);
});

test('persists radio mute and stop choices between visits', async ({ page }) => {
	await enterThroughGate(page);

	await page.getByRole('button', { name: 'Mute radio' }).click();
	await expect
		.poll(() =>
			page.evaluate(() => JSON.parse(localStorage.getItem('wolves-of-ragnarok-radio') ?? '{}'))
		)
		.toMatchObject({ playing: true, muted: true });
	await page.getByRole('button', { name: 'Pause radio' }).click();
	await expect
		.poll(() =>
			page.evaluate(() => JSON.parse(localStorage.getItem('wolves-of-ragnarok-radio') ?? '{}'))
		)
		.toMatchObject({ playing: false, muted: true });

	await page.reload();
	await expect(page.getByRole('button', { name: 'Play radio' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Unmute radio' })).toBeVisible();
	await page.getByRole('button', { name: 'Play radio' }).click();
	await page.getByRole('button', { name: 'Unmute radio' }).click();
	await expect
		.poll(() =>
			page.evaluate(() => JSON.parse(localStorage.getItem('wolves-of-ragnarok-radio') ?? '{}'))
		)
		.toMatchObject({ playing: true, muted: false });
});

test('renders the fantasy portal without broken artwork or overflow', async ({
	page
}, testInfo) => {
	await page.setViewportSize({ width: 1920, height: 1080 });
	await enterThroughGate(page);

	await expect(page).toHaveTitle(/Wolves of Ragnarok/);
	await expect(page.getByRole('heading', { level: 1, name: 'Wolves of Ragnarok' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
	await expect(page.getByText('RUNE AUDIO · 01')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Pause radio' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Valheim 1.0 Has Arrived' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'The Longhouse Doors Open' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Ashlands Expedition Muster' })).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'New Members Enter the Hall' })).toHaveCount(0);
	await expect(page.locator('a[href="/news/valheim-1-0-has-arrived"]')).toHaveCount(0);
	await expect(page.getByRole('heading', { name: 'Yggdrasil', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Server information', exact: true })).toHaveAttribute(
		'href',
		'/servers'
	);
	const warriorBox = await page.locator('.manifesto-warrior').boundingBox();
	expect(warriorBox).not.toBeNull();
	await expect(page.locator('.manifesto-section .manifesto-warrior')).toBeVisible();
	const portalHeading = page.locator('.portal-brand h1');
	await expect(portalHeading).toHaveText('WOLVES OFRAGNAROK');
	await expect(portalHeading).toHaveCSS('font-family', /Uncial Antiqua/);
	await expect(portalHeading).toHaveCSS('text-transform', 'uppercase');
	await expect(page.getByText('Member access')).toHaveCount(0);
	await expect(page.getByText('Sign in')).toHaveCount(0);
	const discordLinks = page.locator('a[href="https://discord.gg/CbjgD7WVfp"]');
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
	await enterThroughGate(page);

	const menu = page.getByRole('button', { name: 'Realm menu' });
	await expect(menu).toBeVisible();
	await menu.click();
	await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Survive', exact: true })).toHaveCount(0);

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

	const liveMap = page.locator('.live-map');
	await expect(liveMap).toBeVisible();
	await expect(liveMap.locator('iframe.public-map')).toBeVisible();
	await expect(page.locator('iframe')).toHaveCount(1);
	await expect(page.getByText('valheim.webble.se', { exact: true }).first()).toBeVisible();
	await expect(page.locator('.population').first()).toHaveText('0 / 10 players');
	await expect(page.getByText('Player names unavailable')).toHaveCount(0);
	await expect(page.getByText('External health')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Open live map' })).toHaveCount(0);
	await expect(page.getByText('Reported version')).toHaveCount(0);
	await page
		.locator('.status-card')
		.first()
		.getByRole('button', { name: 'Copy join address' })
		.click();
	await expect(page.getByRole('button', { name: 'Join address copied' }).first()).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => navigator.clipboard.readText()))
		.toBe('valheim.webble.se');
	await page.screenshot({ path: testInfo.outputPath('servers-live-map.png'), fullPage: true });

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
		playerCount: 0,
		maxPlayers: 10
	});
	const passwordResponse = await request.post('/api/servers/featured/password');
	expect(passwordResponse.status()).toBe(401);
	expect(passwordResponse.headers()['cache-control']).toContain('no-store');

	for (const path of ['/servers', '/members', '/about', '/merch', '/wiki', '/rules', '/register']) {
		const response = await request.get(path);
		expect(response.status(), `${path} should resolve`).toBe(200);
	}
	const removedSurviveResponse = await request.get('/survive');
	expect(removedSurviveResponse.status()).toBe(404);

	await page.goto('/members');
	await expect(page.getByRole('heading', { name: 'Guild Roster' })).toBeVisible();
	await page.goto('/about');
	await expect(page.getByRole('heading', { name: 'About Us' })).toBeVisible();
	await expect((await request.get('/news')).status()).toBe(404);
	await expect((await request.get('/chronicles')).status()).toBe(404);
	await expect((await request.get('/arsenal')).status()).toBe(404);
	await expect((await request.get('/pvp')).status()).toBe(404);
	await expect((await request.get('/news/valheim-1-0-has-arrived')).status()).toBe(404);
	const wikiResponse = await request.get('/api/wiki/search?q=iron');
	await expect(wikiResponse).toBeOK();
	await expect(wikiResponse.json()).resolves.toMatchObject({
		query: 'iron',
		results: expect.any(Array)
	});
	await page.goto('/wiki');
	await expect(page.getByRole('heading', { name: 'Search the Valheim Wiki' })).toBeVisible();
	await page.getByRole('searchbox', { name: 'Search the Valheim Wiki' }).fill('iron');
	await expect(page.getByText('Valheim Wiki entry').first()).toBeVisible();
	await expect(page.getByText('Open full article')).toHaveCount(0);
	await page.getByRole('button', { name: 'Read more' }).first().click();
	await expect(page.locator('.selected-result')).toBeVisible();
	await expect(page.locator('.suggestions')).toBeHidden();
	await expect(page.locator('.results')).toBeHidden();
	await expect((await request.get('/community')).status()).toBe(404);
	await expect((await request.get('/community/welcome-to-the-longhouse')).status()).toBe(404);

	await page.goto('/admin');
	await expect(page).toHaveURL('/');
	await page.goto('/servers');
	await expect(page.getByText('Server password is handed out in Discord.')).toBeVisible();
	await page.goto('/register');
	await expect(page.getByRole('heading', { name: 'Join the Guild' })).toBeVisible();
});
