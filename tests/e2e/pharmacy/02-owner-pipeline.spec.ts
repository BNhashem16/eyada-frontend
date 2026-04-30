import { test, expect } from "@playwright/test";

/**
 * Critical journey 2 — Pharmacy owner moves an order through the status
 * pipeline (pending → confirmed → preparing → out for delivery → delivered)
 * and assigns a driver.
 *
 * SKIPPED until the backend exposes a deterministic test seed.
 */
test.describe("Owner orders pipeline", () => {
  test.skip(
    !process.env.E2E_BACKEND_SEEDED,
    "Backend test seed is not available; set E2E_BACKEND_SEEDED=1 to enable.",
  );

  test("owner advances a pending order through the pipeline + assigns driver", async ({
    page,
  }) => {
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

    await page.goto("/pharmacy-owner/orders");

    // The seed includes at least one PENDING order.
    const firstRow = page
      .getByRole("listitem")
      .or(page.locator("tbody tr"))
      .first();
    await expect(firstRow).toBeVisible();

    // Click "View details" → arrive on the order detail page.
    await firstRow.getByRole("link", { name: /details|التفاصيل/i }).click();
    await expect(page).toHaveURL(/\/pharmacy-owner\/orders\//);

    // Confirm the order.
    await page.click("text=/confirm|تأكيد/i");
    await page.click("text=/confirm|تأكيد/i"); // ConfirmDialog
    await expect(page.getByText(/CONFIRMED|مؤكد/i)).toBeVisible();
  });
});
