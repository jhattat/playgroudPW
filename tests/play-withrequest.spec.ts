import { test, expect, request } from '@playwright/test';

const loginPayLoad = {userEmail: "anshika@gmail.com", userPassword: "Iamking@000"}
let token: string;


test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const loginResponse = await apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login', { data: loginPayLoad })
    expect(loginResponse.ok()).toBeTruthy();
    const loginResponseJson = await loginResponse.json();
    token = loginResponseJson.token;
    console.log(token);
});


test('Client App login', async ({ page }) => {
    
    await page.addInitScript(value => {
  window.localStorage.setItem('token', value);
}, token);

await page.goto('https://rahulshettyacademy.com/client/');

});
