import { expect, test } from '@playwright/test';

const productName = 'Sauce Labs Backpack';

function cents(label: string): number {
  const amount = label.match(/\$\s*(\d+(?:\.\d{1,2})?)/)?.[1];
  if (!amount) throw new Error(`No currency amount in: ${label}`);
  return Math.round(Number(amount) * 100);
}

test('standard user can purchase one product with the correct total', async ({ page }) => {
  await test.step('Sign in and choose a product', async () => {
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();

    await expect(page.getByTestId('inventory-list')).toBeVisible();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  const product = page.getByTestId('inventory-item').filter({
    has: page.getByTestId('inventory-item-name').getByText(productName, { exact: true }),
  });
  await expect(product).toHaveCount(1);
  const catalogPrice = cents(await product.getByTestId('inventory-item-price').innerText());

  await test.step('Add the item and verify the cart', async () => {
    await product.getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(/\/cart\.html$/);

    const cartItem = page.getByTestId('cart-list').getByTestId('inventory-item');
    await expect(cartItem).toHaveCount(1);
    await expect(cartItem.getByTestId('inventory-item-name')).toHaveText(productName);
    await expect(cartItem.getByTestId('item-quantity')).toHaveText('1');
    expect(cents(await cartItem.getByTestId('inventory-item-price').innerText())).toBe(catalogPrice);
  });

  await test.step('Enter customer details and verify the order overview', async () => {
    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    await page.getByTestId('firstName').fill('QA');
    await page.getByTestId('lastName').fill('Tester');
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('checkout-summary-container')).toBeVisible();

    const overviewItem = page.getByTestId('cart-list').getByTestId('inventory-item');
    await expect(overviewItem).toHaveCount(1);
    await expect(overviewItem.getByTestId('inventory-item-name')).toHaveText(productName);
    await expect(overviewItem.getByTestId('item-quantity')).toHaveText('1');
    expect(cents(await overviewItem.getByTestId('inventory-item-price').innerText())).toBe(catalogPrice);

    const subtotal = cents(await page.getByTestId('subtotal-label').innerText());
    const tax = cents(await page.getByTestId('tax-label').innerText());
    const total = cents(await page.getByTestId('total-label').innerText());
    expect(subtotal).toBe(catalogPrice);
    expect(tax).toBeGreaterThanOrEqual(0);
    expect(total).toBe(subtotal + tax);
  });

  await test.step('Finish and verify completion', async () => {
    await page.getByTestId('finish').click();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
  });
});
