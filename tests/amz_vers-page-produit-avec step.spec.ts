import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.amazon.fr/');

  await test.step('Recherche du produit', async () => {
    await page.getByRole('button', { name: 'Decline' }).click();
    await page.getByRole('searchbox', { name: 'Search Amazon.fr' }).click();
    await page.getByRole('searchbox', { name: 'Search Amazon.fr' }).fill('arrosoir');
  });
  await page.getByRole('button', { name: 'arrosoir plante interieur' }).click();
  await expect(page.getByRole('searchbox', { name: 'Search Amazon.fr' })).toBeVisible();
  await page.getByText('Eligible for free delivery').click();
  await expect(page.locator('#p_n_free_shipping_eligible-title')).toContainText('Eligible for free delivery');
  await page.getByLabel('Livlig 5 Litre Watering Can').click();
  await expect(page.locator('#title')).toContainText('Livlig 5 Litre Watering Can for Flowers for Garden & Balcony, High Quality Metal Watering Can 5L Zinc Plated Metal and Detachable Shower, Retro Watering Can with Brass Shower, Anthracite');
});