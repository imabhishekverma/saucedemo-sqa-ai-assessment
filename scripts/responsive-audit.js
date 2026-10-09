const fs = require('node:fs');
const path = require('node:path');
const { chromium, firefox, webkit } = require('@playwright/test');

const outputDir = path.join(__dirname, '..', 'submission', 'evidence', 'responsive');
const widths = [320, 375, 768, 1365];
const height = 812;
const engines = { chromium, firefox, webkit };
const results = [];

fs.mkdirSync(outputDir, { recursive: true });

async function inspect(page, engine, width, step, selectors) {
  const measurement = await page.evaluate((targets) => {
    const controls = Object.fromEntries(targets.map(([name, selector]) => {
      const element = document.querySelector(selector);
      const box = element?.getBoundingClientRect();
      return [name, box ? {
        left: Math.round(box.left),
        right: Math.round(box.right),
        width: Math.round(box.width),
        height: Math.round(box.height),
      } : null];
    }));
    return {
      viewportWidth: window.innerWidth,
      documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      controls,
    };
  }, selectors);
  const problems = [];
  if (measurement.documentWidth > measurement.viewportWidth + 1) {
    problems.push(`horizontal overflow: ${measurement.documentWidth}px document`);
  }
  for (const [name, box] of Object.entries(measurement.controls)) {
    if (!box || box.width < 1 || box.height < 1) {
      problems.push(`${name} missing or zero size`);
    } else if (box.left < -1 || box.right > measurement.viewportWidth + 1) {
      problems.push(`${name} clipped horizontally: ${box.left}..${box.right}`);
    }
  }
  results.push({ engine, width, step, url: page.url(), ...measurement, problems });
  console.log(`${engine.padEnd(8)} ${String(width).padStart(4)} ${step.padEnd(17)} ${problems.length ? problems.join('; ') : 'PASS'}`);
}

async function runOne(engine, browser, width) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  let beforeSubmitFields;
  try {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('[data-test="login-button"]').waitFor({ state: 'visible' });
    await inspect(page, engine, width, 'login', [['login', '[data-test="login-button"]']]);

    await page.locator('[data-test="username"]').fill('standard_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');
    await page.locator('[data-test="login-button"]').click();
    await page.locator('[data-test="inventory-list"]').waitFor({ state: 'visible' });
    const productImages = page.locator('[data-test="inventory-item"] img');
    for (const image of await productImages.all()) await image.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('[data-test="inventory-item"] img')]
      .every((image) => image.complete && image.naturalWidth > 0));
    await inspect(page, engine, width, 'inventory', [['cart link', '[data-test="shopping-cart-link"]'], ['product', '[data-test="inventory-item"]']]);
    await page.screenshot({ path: path.join(outputDir, `${engine}-${width}-inventory.png`), fullPage: true });

    const product = page.locator('[data-test="inventory-item"]').filter({
      has: page.locator('[data-test="inventory-item-name"]').getByText('Sauce Labs Backpack', { exact: true }),
    });
    await product.getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('[data-test="shopping-cart-link"]').click();
    await page.locator('[data-test="cart-list"] [data-test="inventory-item"]').waitFor({ state: 'visible' });
    await inspect(page, engine, width, 'cart', [['checkout', '[data-test="checkout"]']]);

    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').waitFor({ state: 'visible' });
    await inspect(page, engine, width, 'customer details', [['first name', '[data-test="firstName"]'], ['continue', '[data-test="continue"]']]);
    await page.locator('[data-test="firstName"]').fill('QA');
    await page.locator('[data-test="lastName"]').fill('Tester');
    await page.locator('[data-test="postalCode"]').fill('12345');
    beforeSubmitFields = await Promise.all(['firstName', 'lastName', 'postalCode']
      .map((name) => page.locator(`[data-test="${name}"]`).inputValue()));
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="checkout-summary-container"]').waitFor({ state: 'visible', timeout: 10000 });
    await inspect(page, engine, width, 'order overview', [['finish', '[data-test="finish"]'], ['total', '[data-test="total-label"]']]);
    await page.screenshot({ path: path.join(outputDir, `${engine}-${width}-overview.png`), fullPage: true });

    await page.locator('[data-test="finish"]').click();
    await page.locator('[data-test="complete-header"]').waitFor({ state: 'visible' });
    await inspect(page, engine, width, 'completion', [['complete header', '[data-test="complete-header"]']]);
  } catch (error) {
    const afterSubmitFields = await Promise.all(['firstName', 'lastName', 'postalCode']
      .map((name) => page.locator(`[data-test="${name}"]`).inputValue().catch(() => null)));
    const formErrors = await page.locator('[data-test="error"]').allTextContents().catch(() => []);
    results.push({ engine, width, step: 'run error', url: page.url(), beforeSubmitFields, afterSubmitFields, formErrors, problems: [error.message] });
    await page.screenshot({ path: path.join(outputDir, `${engine}-${width}-error.png`), fullPage: true }).catch(() => {});
    console.error(`${engine} ${width} ERROR: ${error.message}`);
  } finally {
    await context.close();
  }
}

(async () => {
  for (const [engine, browserType] of Object.entries(engines)) {
    if (process.env.AUDIT_ENGINE && process.env.AUDIT_ENGINE !== engine) continue;
    const browser = await browserType.launch();
    try {
      for (const width of widths) {
        if (process.env.AUDIT_WIDTH && Number(process.env.AUDIT_WIDTH) !== width) continue;
        await runOne(engine, browser, width);
      }
    } finally {
      await browser.close();
    }
  }
  const summary = {
    runAt: new Date().toISOString(),
    environment: 'Windows; Playwright-managed engines; viewport emulation, not physical devices',
    viewportHeight: height,
    checkedStates: results.length,
    failures: results.filter((row) => row.problems.length),
    results,
  };
  fs.writeFileSync(path.join(outputDir, 'responsive-results.json'), JSON.stringify(summary, null, 2));
  console.log(`Checked ${summary.checkedStates} page states; ${summary.failures.length} flagged. Evidence: ${outputDir}`);
  if (summary.failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
