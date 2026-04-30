import { test, expect } from "@playwright/test";

/**
 * Critical journey 1 — Patient places a pharmacy order end-to-end.
 *
 * SKIPPED until the backend exposes a deterministic test seed. See
 * `tests/e2e/README.md`.
 */
test.describe("Patient pharmacy order", () => {
  test.skip(
    !process.env.E2E_BACKEND_SEEDED,
    "Backend test seed is not available; set E2E_BACKEND_SEEDED=1 to enable.",
  );

  test("browse → add to cart → checkout → see order in list", async ({
    page,
  }) => {
    // 1. Sign in as a patient.
    await page.goto("/login");
    await page.fill(
      "input[name=email]",
      process.env.E2E_PATIENT_EMAIL ?? "patient@e2e.local",
    );
    await page.fill(
      "input[name=password]",
      process.env.E2E_PATIENT_PASSWORD ?? "password",
    );
    await page.click("button[type=submit]");
    await page.waitForURL(/\/patient\/dashboard/);

    // 2. Open the pharmacy browser, search for a known product.
    await page.goto("/patient/pharmacy");
    await page.fill(
      'input[placeholder*="ابحث"], input[placeholder*="Search"]',
      "Paracetamol",
    );
    await expect(
      page.getByRole("button", { name: /add to cart|أضف/i }).first(),
    ).toBeVisible();
    await page
      .getByRole("button", { name: /add to cart|أضف/i })
      .first()
      .click();

    // 3. Cart shows the item and a non-zero subtotal.
    await page.goto("/patient/cart");
    await expect(page.locator("text=Paracetamol")).toBeVisible();

    // 4. Place the order.
    await page.click("text=/proceed to checkout|إتمام الطلب/i");
    await page.waitForURL(/\/patient\/checkout/);
    await page.click("text=/place order|تأكيد الطلب/i");

    // 5. Order appears in the orders list.
    await page.waitForURL(/\/patient\/orders/);
    await expect(page.getByRole("listitem").first()).toBeVisible();
  });
});
