import { test, expect } from '@playwright/test';


// v Ajout
// v Coher
// v supprimer
// Clear complete


test('Add To the Todo List', async ({ page }) => {

  // Given I'm on a fresh 
  await page.goto('https://demo.playwright.dev/todomvc/#/todomvc/#/');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  
  // When I add a todo
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add One');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  // Then it should be in the list
  // I should have one element in the todo-list
  await page.pause();
  
  await expect(page.locator('body')).toContainText('Add One');
  await expect(page.locator('.main')).toBeVisible();
  await expect(page.locator('ul.todo-list')
                    .getByRole('listitem')).toHaveCount(1);

});

test('toggle one item', async ({ page }) => {
  // Given I'm on a fresh 
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  
  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add One');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('checkbox', { name: 'Toggle Todo' }).check();

  // récupérer l'element et vérifier la classe toggle
  await expect(
  page.locator('ul.todo-list li').filter({ hasText: 'one' })
).toHaveClass(/completed/);
});

test('delete one todo', async ({ page }) => {
  // Recording...
  await page.goto('https://demo.playwright.dev/todomvc/#/');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('add one');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('add Two');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  
  const secondTodo = page.getByRole('listitem').filter({ hasText: 'add Two' });
  await secondTodo.hover();
  await secondTodo.getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('ul.todo-list li')).toHaveCount(1);
  await expect(page.locator('ul.todo-list')).toContainText('add one');
  await expect(page.locator('ul.todo-list')).not.toContainText('add Two');
  await expect(page.locator('body')).toContainText('Add One', { ignoreCase: true });
  
});

test('filter une todo', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/#/');

  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add One');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add Two');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add Three');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('listitem').filter({ hasText: 'Add Two' }).getByLabel('Toggle Todo').check();
  await page.getByRole('link', { name: 'Completed' }).click();
  await expect(page.getByTestId('todo-title')).toContainText('Add Two');
  await expect(page.locator('ul.todo-list')
                    .getByRole('listitem')).toHaveCount(1);
  // vérifier qu'il n'y a que 1 élément dans la liste


  await page.getByRole('link', { name: 'Active' }).click();
  await expect(page.getByTestId('todo-title')).toHaveText([
  'Add One',
  'Add Three',
]);
  await expect(page.locator('ul.todo-list')
                    .getByRole('listitem')).toHaveCount(2);
  
  await page.getByRole('link', { name: 'All' }).click();

  await expect(page.locator('ul.todo-list')
                    .getByRole('listitem')).toHaveCount(3);
  
});


test('clear complete', async ({ page }) => {
  // Recording...
  await page.goto('https://demo.playwright.dev/todomvc/#/');

  await page.getByRole('textbox', { name: 'What needs to be done?' }).click();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add One');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('Add Two');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  await page.getByRole('listitem').filter({ hasText: 'Add Two' }).getByLabel('Toggle Todo').check();
  await page.getByRole('button', { name: 'Clear completed' }).click();
  // only one element should be present.
  await expect(page.getByTestId('todo-title')).toContainText('Add One');
  await expect(page.locator('ul.todo-list')
                    .getByRole('listitem')).toHaveCount(1);
});
