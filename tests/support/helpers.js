const { expect } = require('@playwright/test');

function productCard(page, name) {
  return page.getByTestId('inventory-item').filter({
    has: page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
  });
}

function cents(label) {
  const amount = label.match(/\$\s*(\d+(?:\.\d{1,2})?)/)?.[1];
  if (!amount) throw new Error(`No currency amount in: ${label}`);
  return Math.round(Number(amount) * 100);
}

async function addFromInventory(page, name) {
  const item = productCard(page, name);
  await expect(item).toHaveCount(1);
  await item.getByRole('button', { name: 'Add to cart' }).click();
}

async function fillCustomer(page, values) {
  for (const name of ['firstName', 'lastName', 'postalCode']) {
    await page.getByTestId(name).fill(values[name] ?? '');
  }
  for (const name of ['firstName', 'lastName', 'postalCode']) {
    await expect(page.getByTestId(name)).toHaveValue(values[name] ?? '');
  }
}

module.exports = { productCard, cents, addFromInventory, fillCustomer };
