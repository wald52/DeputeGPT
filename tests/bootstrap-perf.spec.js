const { test, expect } = require('playwright/test');

test('le chargement initial utilise l artefact leger et rend l hemicycle directement cliquable', async ({ page }) => {
  const requestedUrls = [];

  page.on('requestfinished', request => {
    requestedUrls.push(request.url());
  });

  await page.goto('/');
  await expect(page.locator('#search-input')).toBeVisible();
  await expect.poll(
    () => requestedUrls.some(url => url.includes('/public/data/deputes_actifs/latest.json'))
  ).toBeTruthy();
  await expect.poll(
    () => requestedUrls.some(url => /\/public\/data\/deputes_actifs\/boot-v\d{4}-\d{2}-\d{2}\.json/.test(url))
  ).toBeTruthy();

  expect(
    requestedUrls.some(url => /\/public\/data\/deputes_actifs\/v\d{4}-\d{2}-\d{2}\.json$/.test(url))
  ).toBeFalsy();
  expect(
    requestedUrls.some(url => url.includes('/public/data/rag/manifest.json'))
  ).toBeFalsy();

  // L'hemicycle est le geste principal annonce par le panneau ("Cliquez sur un
  // siege") : il est rendu sans etape de chargement manuelle, et le placeholder
  // avec bouton n'est reserve qu'au cas d'erreur.
  await expect(page.locator('[data-hemicycle-stage] svg')).toBeVisible();
  await expect(page.locator('[data-hemicycle-stage] [role="button"]').first()).toBeVisible();
  await expect(page.locator('[data-load-hemicycle]')).toHaveCount(0);

  await page.locator('#search-input').fill('David');
  await expect(page.locator('#search-results .search-result-button').first()).toBeVisible();
  await page.locator('#search-input').press('Escape');
  await expect(page.locator('#search-results')).toBeHidden();
});
