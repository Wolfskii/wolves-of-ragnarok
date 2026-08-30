import { expect, test } from '@playwright/test';

test('renders the fantasy portal without broken artwork or overflow', async ({
	page
}, testInfo) => {
	await page.setViewportSize({ width: 1920, height: 1080 });
	await page.goto('/');

	await expect(page).toHaveTitle(/Wolves of Ragnarok/);
	await expect(page.getByRole('heading', { level: 1, name: 'Wolves of Ragnarok' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Yggdrasil' })).toBeVisible();
	await expect(page.locator('.brand-title')).toHaveCSS('font-family', /GR Read One/);
	await expect(page.locator('.login-shrine .guardian')).toHaveCount(0);
	await expect(page.locator('.brand-title')).toHaveCSS('text-shadow', /168, 59, 67/);
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

	await page.goto('/admin');
	await expect(page).toHaveURL('/');
	await page.goto('/register');
	await expect(page.getByRole('heading', { name: 'Join the Pack' })).toBeVisible();
});
