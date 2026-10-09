const { test, expect } = require('./support/fixtures');
const { catalog } = require('./support/data');
const { productCard } = require('./support/helpers');

for (const item of catalog.slice(0, 2)) {
  test(`product details match the grid for ${item.name}`, async ({ signedInPage: page }) => {
    const card = productCard(page, item.name);
    const description = await card.getByTestId('inventory-item-desc').innerText();
    await card.getByTestId('inventory-item-name').click();
    await expect(page.getByTestId('back-to-products')).toBeVisible();
    const detail = page.getByTestId('inventory-item');
    await expect(detail).toHaveCount(1);
    await expect(detail.getByTestId('inventory-item-name')).toHaveText(item.name);
    await expect(detail.getByTestId('inventory-item-price')).toHaveText(item.price);
    await expect(detail.getByTestId('inventory-item-desc')).toHaveText(description);
    await expect.poll(() => detail.locator('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
    await page.getByTestId('back-to-products').click();
    await expect(page.getByTestId('inventory-list')).toBeVisible();
  });
}

test('item added from details appears in the cart and can be removed there', async ({ signedInPage: page }) => {
  const item = catalog[0];
  await productCard(page, item.name).getByTestId('inventory-item-name').click();
  await expect(page.getByTestId('back-to-products')).toBeVisible();
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await page.getByTestId('shopping-cart-link').click();
  const cartItem = page.getByTestId('cart-list').getByTestId('inventory-item');
  await expect(cartItem).toHaveCount(1);
  await expect(cartItem.getByTestId('inventory-item-name')).toHaveText(item.name);
  await cartItem.getByRole('button', { name: 'Remove' }).click();
  await expect(cartItem).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});
