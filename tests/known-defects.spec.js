const { test, expect } = require('./support/fixtures');
const { customer } = require('./support/data');
const { fillCustomer } = require('./support/helpers');

test('F-01: empty cart should not start checkout', async ({ signedInPage: page }) => {
  await page.getByTestId('shopping-cart-link').click();
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(0);
  test.fail(true, 'F-01: empty-cart checkout remains enabled in the demo');
  await expect(page.getByTestId('checkout')).toBeDisabled({ timeout: 3000 });
});

test('F-02: direct order overview should require customer details', async ({ cartPage: page }) => {
  await page.goto('/checkout-step-two.html');
  await expect(page).toHaveURL(/\/checkout-step-(one|two)\.html$/);
  test.fail(true, 'F-02: a direct overview URL bypasses the customer-details step');
  await expect(page).toHaveURL(/\/checkout-step-one\.html$/, { timeout: 3000 });
});

test('F-03: space-only customer details should be rejected', async ({ checkoutPage: page }) => {
  await fillCustomer(page, Object.fromEntries(Object.keys(customer).map((key) => [key, '   '])));
  test.fail(true, 'F-03: whitespace-only values pass required-field validation');
  await page.getByTestId('continue').click();
  await expect(page.getByTestId('error')).toBeVisible({ timeout: 3000 });
});
