const { test, expect } = require('./support/fixtures');
const { catalog } = require('./support/data');
const { productCard, cents } = require('./support/helpers');

test('inventory grid lists the six expected products with their prices', async ({ signedInPage: page }) => {
  await expect(page.getByTestId('inventory-item')).toHaveCount(catalog.length);
  await expect(page.getByTestId('inventory-item-name')).toHaveText(catalog.map((item) => item.name));
  for (const item of catalog) {
    await expect(productCard(page, item.name).getByTestId('inventory-item-price')).toHaveText(item.price);
  }
});

const sortCases = [
  { name: 'name descending', option: 'za', values: 'names', descending: true },
  { name: 'price low to high', option: 'lohi', values: 'prices', descending: false },
  { name: 'price high to low', option: 'hilo', values: 'prices', descending: true },
];

for (const sortCase of sortCases) {
  test(`inventory sorts by ${sortCase.name}`, async ({ signedInPage: page }) => {
    await page.getByTestId('product-sort-container').selectOption(sortCase.option);
    await expect(page.getByTestId('product-sort-container')).toHaveValue(sortCase.option);
    const values = sortCase.values === 'names'
      ? catalog.map((item) => item.name).sort((a, b) => b.localeCompare(a))
      : catalog.map((item) => cents(item.price)).sort((a, b) => sortCase.descending ? b - a : a - b);
    await expect.poll(async () => sortCase.values === 'names'
      ? page.getByTestId('inventory-item-name').allTextContents()
      : (await page.getByTestId('inventory-item-price').allTextContents()).map(cents)
    ).toEqual(values);
  });
}

test('inventory cannot be opened without signing in', async ({ page }) => {
  await page.goto('/inventory.html');
  await expect(page.getByTestId('login-button')).toBeVisible();
  await expect(page.getByTestId('inventory-list')).toHaveCount(0);
});
