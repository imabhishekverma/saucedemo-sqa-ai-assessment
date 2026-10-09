const { test, expect, signIn } = require('./support/fixtures');
const { invalidLogins } = require('./support/data');

test('standard user signs in and sees inventory', async ({ page }) => {
  await signIn(page);
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});

for (const account of invalidLogins) {
  test(`login rejects ${account.name}`, async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username').fill(account.username);
    await page.getByTestId('password').fill(account.password);
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('error')).toHaveText(account.error);
    await expect(page.getByTestId('inventory-list')).toHaveCount(0);
  });
}
