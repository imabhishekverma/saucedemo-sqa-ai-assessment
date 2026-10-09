const { test, expect } = require('./support/fixtures');
const { catalog } = require('./support/data');
const { addFromInventory } = require('./support/helpers');

test('empty cart shows no products and Continue Shopping returns to inventory', async ({ signedInPage: page }) => {
  await page.getByTestId('shopping-cart-link').click();
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(0);
  await page.getByTestId('continue-shopping').click();
  await expect(page.getByTestId('inventory-list')).toBeVisible();
});

test('adding and removing a product updates cart and badge', async ({ cartPage: page }) => {
  const cartItem = page.getByTestId('cart-list').getByTestId('inventory-item');
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await expect(cartItem.getByTestId('inventory-item-name')).toHaveText(catalog[0].name);
  await expect(cartItem.getByTestId('inventory-item-price')).toHaveText(catalog[0].price);
  await expect(cartItem.getByTestId('item-quantity')).toHaveText('1');
  await cartItem.getByRole('button', { name: 'Remove' }).click();
  await expect(cartItem).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});

test('two selected products persist after cart reload and one can be removed', async ({ signedInPage: page }) => {
  await addFromInventory(page, catalog[0].name);
  await addFromInventory(page, catalog[1].name);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
  await page.getByTestId('shopping-cart-link').click();
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(2);
  await page.reload();
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(2);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('2');
  await page.getByTestId('cart-list').getByTestId('inventory-item')
    .filter({ has: page.getByTestId('inventory-item-name').getByText(catalog[0].name, { exact: true }) })
    .getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByTestId('cart-list').getByTestId('inventory-item')).toHaveCount(1);
  await expect(page.getByTestId('inventory-item-name')).toHaveText(catalog[1].name);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});
