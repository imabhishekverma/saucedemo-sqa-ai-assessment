# SauceDemo SQA assessment - checkout smoke test

One live-validated Playwright JavaScript end-to-end test covers `standard_user` signing in, adding a product, verifying cart and checkout data, and reaching the order completion page. The assessment PDF is delivered separately as a single document containing the exploratory work, three confirmed findings, embedded evidence, AI prompt log, and one-page QA strategy.

## Requirements

- Node.js 22 or 24
- Network access to https://www.saucedemo.com/

## Run

```powershell
npm ci
npx playwright install chromium
npm test
```

To watch the browser: `npm run test:headed`. To inspect a failed run: `npx playwright show-report`.

The test uses Playwright's isolated browser context for each run. It reads the catalog price from the UI, compares it through cart and checkout, checks quantity and total arithmetic, and uses retrying UI assertions. It does not use fixed sleeps. Failure screenshots and traces are saved under `test-results/`.

## AI use and limits

Codex helped draft the flow and assertions. Live inspection corrected two locator assumptions: the menu image is covered by its accessible button, and `summary-info` is not a test ID on the overview page. The final test uses observed `data-test` attributes and was run against the live site. It proves the visible UI journey for one product and account; SauceDemo is a sample app, so it does not prove payment processing, inventory reservation, or a backend shipment.
