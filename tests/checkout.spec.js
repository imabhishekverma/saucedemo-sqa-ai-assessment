const { test, expect } = require('./support/fixtures');
const { catalog, customer, missingCustomerFields } = require('./support/data');
const { addFromInventory, cents, fillCustomer } = require('./support/helpers');

test('standard user completes a one-product order with correct item and totals', async ({ checkoutPage: page }) => {
  await fillCustomer(page, customer);
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('checkout-summary-container')).toBeVisible();

  const item = page.getByTestId('cart-list').getByTestId('inventory-item');
  await expect(item).toHaveCount(1);
  await expect(item.getByTestId('inventory-item-name')).toHaveText(catalog[0].name);
  await expect(item.getByTestId('item-quantity')).toHaveText('1');
  await expect(item.getByTestId('inventory-item-price')).toHaveText(catalog[0].price);

  const subtotal = cents(await page.getByTestId('subtotal-label').innerText());
  const tax = cents(await page.getByTestId('tax-label').innerText());
  const total = cents(await page.getByTestId('total-label').innerText());
  expect(subtotal).toBe(cents(catalog[0].price));
  expect(tax).toBeGreaterThanOrEqual(0);
  expect(total).toBe(subtotal + tax);

  await page.getByTestId('finish').click();
  await expect(page).toHaveURL(/\/checkout-complete\.html$/);
  await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});

for (const row of missingCustomerFields) {
  test(`checkout rejects missing ${row.name}`, async ({ checkoutPage: page }) => {
    await fillCustomer(page, { ...customer, [row.omitted]: '' });
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText(row.error);
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
  });
}

test('canceling customer details returns to the cart without losing its item', async ({ checkoutPage: page }) => {
  await page.getByTestId('cancel').click();
  await expect(page).toHaveURL(/\/cart\.html$/);
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(1);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('two-product checkout carries both items and computes the displayed total', async ({ signedInPage: page }) => {
  await addFromInventory(page, catalog[0].name);
  await addFromInventory(page, catalog[1].name);
  await page.getByTestId('shopping-cart-link').click();
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(2);
  await page.getByTestId('checkout').click();
  await expect(page.getByTestId('firstName')).toBeVisible();
  await fillCustomer(page, customer);
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('checkout-summary-container')).toBeVisible();

  const items = page.getByTestId('cart-list').getByTestId('inventory-item');
  await expect(items).toHaveCount(2);
  await expect(items.getByTestId('inventory-item-name')).toHaveText(catalog.slice(0, 2).map((item) => item.name));
  await expect(items.getByTestId('item-quantity')).toHaveText(['1', '1']);
  const subtotal = cents(await page.getByTestId('subtotal-label').innerText());
  const tax = cents(await page.getByTestId('tax-label').innerText());
  const total = cents(await page.getByTestId('total-label').innerText());
  expect(subtotal).toBe(catalog.slice(0, 2).reduce((sum, item) => sum + cents(item.price), 0));
  expect(total).toBe(subtotal + tax);
  await page.getByTestId('finish').click();
  await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
});
