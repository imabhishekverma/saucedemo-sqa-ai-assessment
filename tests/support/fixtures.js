const { test: base, expect } = require('@playwright/test');
const { standardUser, catalog } = require('./data');
const { addFromInventory } = require('./helpers');

async function signIn(page, account = standardUser) {
  await page.goto('/');
  await page.getByTestId('username').fill(account.username);
  await page.getByTestId('password').fill(account.password);
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('inventory-list')).toBeVisible();
  await expect(page).toHaveURL(/\/inventory\.html$/);
}

const test = base.extend({
  signedInPage: async ({ page }, use) => {
    await signIn(page);
    await use(page);
  },
  cartPage: async ({ signedInPage }, use) => {
    await addFromInventory(signedInPage, catalog[0].name);
    await signedInPage.getByTestId('shopping-cart-link').click();
    await expect(signedInPage.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(1);
    await use(signedInPage);
  },
  checkoutPage: async ({ cartPage }, use) => {
    await cartPage.getByTestId('checkout').click();
    await expect(cartPage.getByTestId('firstName')).toBeVisible();
    await use(cartPage);
  },
});

module.exports = { test, expect, signIn };
