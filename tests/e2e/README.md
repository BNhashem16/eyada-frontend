# Pharmacy module — E2E journeys

These five Playwright journeys cover the critical revenue paths of the pharmacy
module across the three role surfaces:

1. **Patient pharmacy order** — patient browses, adds to cart, places an order.
2. **Owner orders pipeline** — owner sees pending order, advances status,
   assigns driver.
3. **Settlement processing** — owner requests settlement, admin processes.
4. **Prescription request** — patient uploads prescription, owner fulfills.
5. **Admin pharmacy management** — admin approves/rejects/suspends pharmacies,
   creates a coupon and a campaign.

## Running

```bash
npm run test:e2e          # headless across chromium + webkit
npm run test:e2e:ui       # interactive UI mode
```

## Status

All five tests are currently marked `.skip` until the backend (`C:\Nest\eyada_backend`)
has a deterministic test fixture/seed available. The skip markers are intentional
and documented per test. Removing `.skip` without a seed would produce flaky
green-but-fake E2E results.

## Backend prerequisites (cross-repo)

To unskip these tests, the backend must expose:

- A test database with a known seed (5 pharmacies, 3 drivers, ~30 products,
  pre-created users for each role).
- A `/test/reset` endpoint (or migration script) that resets the seed between
  test runs. Gated to `NODE_ENV=test` only.
- Login credentials per role available via `E2E_*_EMAIL` / `E2E_*_PASSWORD`
  environment variables.

See `playwright.config.ts` for the `E2E_BASE_URL` env var that points each
test runs at.
