# SauceDemo SQA assessment - Playwright JavaScript suite

The original assessment asks for one end-to-end test; `npm run test:smoke` runs that checkout flow. This repository also contains the requested focused regression cases for login, inventory, product details, cart and checkout. The separate assessment PDF contains the exploratory work, three confirmed findings, embedded evidence, AI prompt log and QA strategy.

## Requirements

- Node.js 22 or 24
- Network access to https://www.saucedemo.com/

## Run

```powershell
npm ci
npx playwright install chromium firefox webkit
npm test
```

Run only the primary checkout flow with `npm run test:smoke`. To watch the browser, use `npm run test:headed`; inspect a failure with `npx playwright show-report`. All specs run in Playwright Chromium, Firefox and WebKit. WebKit on Windows is engine coverage, not branded Safari on macOS.

## Test coverage

| Area | Distinct cases |
| --- | ---: |
| Login: valid, required fields, wrong/unknown credentials, locked account | 6 |
| Inventory grid, three sort choices, unauthenticated access | 5 |
| Product details for two products, add/remove from details | 3 |
| Empty cart, add/remove, two-item reload persistence | 3 |
| Checkout success, required fields, cancel, two-item total | 6 |
| Three documented defects as expected-failure regression checks | 3 |
| **Total** | **26** |

`tests/support/fixtures.js` provides fresh `signedInPage`, `cartPage` and `checkoutPage` fixtures. `tests/support/data.js` holds the credential, catalog and checkout datasets; loops create separate named cases. Playwright provides a new browser context for each case. The suite uses retrying assertions and stable observed test IDs, with no fixed sleeps.

The three cases in `known-defects.spec.js` use `test.fail()` because F-01 through F-03 remain open. They execute and fail at the documented behavior, so the runner treats them as expected failures. An unexpected pass will make the run red and prompt a retest of the bug report. They do not count as product fixes.

For a responsive audit of login, inventory, cart, customer details, order overview and completion at 320, 375, 768 and 1365 px in all three engines, run `npm run test:responsive`. The script measures document width and key-control clipping, saves screenshots and JSON results under `submission/evidence/responsive/`, and exits with an error if a measured check fails. These are viewport simulations, not physical-device runs.

Verified on Windows on 9 Oct 2026: the full suite completed 78 browser executions (69 ordinary passes and 9 expected failures); the primary smoke flow passed in all three engines. A complete responsive rerun passed all 72 page-state checks. The three reported checkout findings reproduced at the UI level in all three engines; original receipt evidence was downloaded in Chromium. Earlier intermittent WebKit checkout anomalies did not reproduce in isolated and full reruns. An initial 3-worker suite run had a blank WebKit login page in one case; that case passed alone and the complete 2-worker rerun passed. No additional defect is claimed from those transient runs.

Failure screenshots and traces are saved under `test-results/`. The one-product and two-product checkout cases check item identity, quantity, displayed subtotal and total arithmetic. These UI tests do not verify payment processing, inventory reservation or backend shipment.

## AI use and limits

Codex drafted and revised the tests, datasets and fixtures. Live inspection established exact validation messages, sort options, product-detail selectors and cart behavior. Earlier locator assumptions were corrected: the menu icon image does not receive clicks, and `summary-info` is not a test ID on the overview page. The candidate should review every generated assertion and the three expected-failure decisions before submission.
