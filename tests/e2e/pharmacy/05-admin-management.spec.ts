import { test, expect } from "@playwright/test";

/**
 * Critical journey 5 — Admin manages pharmacies and creates promotional
 * surfaces (coupons + campaigns).
 *
 * SKIPPED until the backend exposes a deterministic test seed.
 */
test.describe("Admin pharmacy management", () => {
  test.skip(
    !process.env.E2E_BACKEND_SEEDED,
    "Backend test seed is not available; set E2E_BACKEND_SEEDED=1 to enable.",
  );

  test("admin approves a pharmacy + creates a coupon", async ({ page }) => {
    await page.goto("/login");
    await page.fill(
      "input[name=email]",
      process.env.E2E_ADMIN_EMAIL ?? "admin@e2e.local",
    );
    await page.fill(
      "input[name=password]",
      process.env.E2E_ADMIN_PASSWORD ?? "password",
    );
    await page.click("button[type=submit]");
    await page.waitForURL(/\/admin/);

    // Approve the first pending pharmacy.
    await page.goto("/admin/pharmacies");
    await page.click("text=/approve|موافقة/i");
    await page.click("text=/approve|موافقة/i"); // ConfirmDialog
    await expect(
      page.getByText(/approved|تمت الموافقة/i).first(),
    ).toBeVisible();

    // Create a coupon.
    await page.goto("/admin/pharmacy-coupons");
    await page.click("text=/add|إضافة/i");
    await page.fill('input[name="code"]', "E2E10");
    await page.fill('input[name="value"]', "10");
    await page.click('button[type="submit"]');
    await expect(page.getByText("E2E10")).toBeVisible();
  });
});
