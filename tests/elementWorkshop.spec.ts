import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.amazon.fr/');
  await page.getByRole('searchbox', { name: 'Search Amazon.fr' }).fill('marteau');
  await page.keyboard.press('Enter');
  //await page.getByRole('searchbox', { name: 'Search Amazon.fr' }).press('Enter');
});
//https://demoqa.com/buttons
