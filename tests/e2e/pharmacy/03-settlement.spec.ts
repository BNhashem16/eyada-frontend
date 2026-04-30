import { test, expect } from "@playwright/test";

/**
 * Critical journey 3 — Pharmacy owner requests a settlement, admin processes
 * it. Two roles, one feature, money on the line.
 *
 * SKIPPED until the backend exposes a deterministic test seed.
 */
test.describe("Settlement processing", () => {
  test.skip(
    !process.env.E2E_BACKEND_SEEDED,
    "Backend test seed is not available; set E2E_BACKEND_SEEDED=1 to enable.",
  );

  test("owner requests settlement → admin completes it", async ({ page }) => {
    // Owner: request settlement.
    await page.goto("/login");
    await page.fill(
      "input[name=email]",
      process.env.E2E_OWNER_EMAIL ?? "owner@e2e.local",
    );
    await page.fill(
      "input[name=password]",
      process.env.E2E_OWNER_PASSWORD ?? "password",
    );
    await page.click("button[type=submit]");
    await page.waitForURL(/\/pharmacy-owner\/dashboard/);

    await page.goto("/pharmacy-owner/wallet");
    await page.click("text=/request settlement|طلب التسوية/i");

    await page.fill('input[type="number"]', "100");
    await page.click(
      'button:has-text("request settlement"), button:has-text("طلب التسوية")',
    );
    await expect(
      page.getByText(/created|تم الإنشاء|تم/i).first(),
    ).toBeVisible();

    // Switch to admin role.
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

    await page.goto("/admin/pharmacy-settlements");
    await page.click("text=/mark processing|قيد المعالجة/i");
    await page.click("text=/confirm|تأكيد/i");
    await page.click("text=/mark completed|اكتمال/i");
    await page.click("text=/confirm|تأكيد/i");
  });
});
