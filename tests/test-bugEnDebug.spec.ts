import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://demoqa.com/');
  await page.getByRole('link', { name: 'Elements' }).click();
  await page.getByRole('link', { name: 'Text Box' }).click();
  //await page.getByRole('textbox', { name: 'Full Name' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Exemple !');
  await page.getByRole('textbox', { name: 'Full Name' }).press('Tab');
  await page.getByRole('textbox', { name: 'name@example.com' }).click();
  await page.getByRole('textbox', { name: 'name@example.com' }).fill('Email.email.com');
  await page.getByRole('textbox', { name: 'name@example.com' }).press('Tab');
  await page.getByRole('textbox', { name: 'Current Address' }).fill('Un exemple de mail');
  await page.getByRole('textbox', { name: 'Current Address' }).press('Tab');
  await page.locator('#permanentAddress').fill('Une adresse');
  await page.locator('#permanentAddress').click();
  await page.getByRole('button', { name: 'Submit' }).click();
  // assert that error occurs
  const champEmail = await page.getByRole('textbox', { name: 'name@example.com' });
  await expect(champEmail).toHaveClass(/field-error/);
  await page.getByRole('textbox', { name: 'name@example.com' }).click();
  await page.getByRole('textbox', { name: 'name@example.com' }).fill('Email@email.com');
  await page.getByRole('textbox', { name: 'name@example.com' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
});