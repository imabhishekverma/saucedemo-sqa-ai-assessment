# SauceDemo SQA assessment - checkout smoke test

One live-validated Playwright JavaScript end-to-end test covers `standard_user` signing in, adding a product, verifying cart and checkout data, and reaching the order completion page. The assessment PDF is delivered separately as a single document containing the exploratory work, three confirmed findings, embedded evidence, AI prompt log, and one-page QA strategy.

## Requirements

- Node.js 22 or 24
- Network access to https://www.saucedemo.com/

## Run

```powershell
npm ci
npx playwright install chromium firefox webkit
npm test
```

To watch the browser: `npm run test:headed`. To inspect a failed run: `npx playwright show-report`. The same checkout test runs in Playwright Chromium, Firefox and WebKit. WebKit on Windows is engine coverage, not a test in branded Safari on macOS.

For a responsive audit of login, inventory, cart, customer details, order overview and completion at 320, 375, 768 and 1365 px in all three engines, run `npm run test:responsive`. The script measures document width and key-control clipping, saves screenshots and JSON results under `submission/evidence/responsive/`, and exits with an error if a measured check fails. These are viewport simulations, not physical-device runs.

Verified on Windows on 9 Oct 2026: the checkout test passed in all three engines, and all 72 responsive page-state checks passed. The three reported checkout findings also reproduced at the UI level in all three engines. The original receipt evidence was downloaded in Chromium. One early WebKit space-only retest timed out; isolated reruns and the full retest matrix passed, so the timeout is not reported as a product defect.

The test uses Playwright's isolated browser context for each run. It reads the catalog price from the UI, compares it through cart and checkout, checks quantity and total arithmetic, and uses retrying UI assertions. It does not use fixed sleeps. Failure screenshots and traces are saved under `test-results/`.

## AI use and limits

Codex helped draft the flow and assertions. Live inspection corrected two locator assumptions: the menu image is covered by its accessible button, and `summary-info` is not a test ID on the overview page. The final test uses observed `data-test` attributes and was run against the live site. It proves the visible UI journey for one product and account; SauceDemo is a sample app, so it does not prove payment processing, inventory reservation, or a backend shipment.
