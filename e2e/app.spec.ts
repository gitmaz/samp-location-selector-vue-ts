import { expect, test, type APIRequestContext } from '@playwright/test';

test.describe.configure({ timeout: 90_000 });

async function clearLocations(request: APIRequestContext) {
  const res = await request.get('/api/locations');
  expect(res.ok()).toBeTruthy();
  const rows = (await res.json()) as { id: number }[];
  for (const row of rows) {
    const del = await request.delete(`/api/locations/${row.id}`);
    expect(del.ok()).toBeTruthy();
  }
}

test.describe('Browser UI', () => {
  test.beforeEach(async ({ request }) => {
    await clearLocations(request);
  });

  test('loads map, hint, and leaflet', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Location selector/i })).toBeVisible();
    await expect(
      page.getByText(/choose a location point/i)
    ).toBeVisible();
    const mapWrap = page.locator('.map-wrap');
    await expect(mapWrap).toBeVisible({ timeout: 30_000 });
    await expect(mapWrap.locator('.leaflet-container')).toBeVisible();
  });

  test('navigates to Saved locations and shows empty state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Saved locations' }).click();
    await expect(page.getByText('No saved locations yet')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible();
  });

  test('click map, save, and see row on Saved locations', async ({ page }) => {
    await page.goto('/');
    const mapWrap = page.locator('.map-wrap');
    await expect(mapWrap).toBeVisible({ timeout: 30_000 });
    await mapWrap.locator('.leaflet-container').click({ position: { x: 420, y: 260 } });

    await expect(page.getByText(/Address:/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save location' })).toBeEnabled({
      timeout: 15_000,
    });

    await expect(page.getByText('Resolving…')).not.toBeVisible({ timeout: 45_000 });

    const saveBtn = page.getByRole('button', { name: 'Save location' });
    const [postRes] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/locations') &&
          r.request().method() === 'POST',
        { timeout: 60_000 }
      ),
      saveBtn.click(),
    ]);
    expect(
      postRes.status(),
      `POST /api/locations failed: ${await postRes.text()}`
    ).toBe(201);

    await expect(page.locator('p.ok')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('p.ok')).toContainText('Saved:');

    await page.getByRole('link', { name: 'Saved locations' }).click();
    await expect(page.locator('.list .item')).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator('.list .item .addr').first()).not.toHaveText('');
  });

  test('deletes a saved location from the list', async ({ page }) => {
    await page.goto('/');
    const mapWrap = page.locator('.map-wrap');
    await expect(mapWrap).toBeVisible({ timeout: 30_000 });
    await mapWrap.locator('.leaflet-container').click({ position: { x: 420, y: 260 } });
    await expect(page.getByRole('button', { name: 'Save location' })).toBeEnabled({
      timeout: 15_000,
    });
    await expect(page.getByText('Resolving…')).not.toBeVisible({ timeout: 45_000 });
    const saveBtn2 = page.getByRole('button', { name: 'Save location' });
    const [postRes2] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/locations') &&
          r.request().method() === 'POST',
        { timeout: 60_000 }
      ),
      saveBtn2.click(),
    ]);
    expect(postRes2.status(), `POST failed: ${await postRes2.text()}`).toBe(201);
    await expect(page.locator('p.ok')).toContainText('Saved:');

    await page.getByRole('link', { name: 'Saved locations' }).click();
    await expect(page.locator('.list .item')).toHaveCount(1);

    page.once('dialog', (d) => d.accept());
    await page.locator('button.del').click();
    await expect(page.getByText('No saved locations yet')).toBeVisible({ timeout: 15_000 });
  });
});
