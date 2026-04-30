import { test, expect } from "@playwright/test";
import path from "node:path";

/**
 * Critical journey 4 — Patient uploads a prescription, admin assigns it to a
 * pharmacy, owner fulfills.
 *
 * SKIPPED until the backend exposes a deterministic test seed.
 */
test.describe("Prescription request", () => {
  test.skip(
    !process.env.E2E_BACKEND_SEEDED,
    "Backend test seed is not available; set E2E_BACKEND_SEEDED=1 to enable.",
  );

  test("patient uploads → admin assigns → owner fulfills", async ({ page }) => {
    // 1. Patient uploads a prescription.
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
    await page.waitForURL(/\/patient/);

    await page.goto("/patient/prescriptions/upload");

    // Upload a known fixture image.
    const fixturePath = path.join(
      __dirname,
      "..",
      "fixtures",
      "prescription.png",
    );
    await page.setInputFiles('input[type="file"]', fixturePath);

    await page.click("text=/submit request|إرسال الطلب/i");
    await page.waitForURL(/\/patient\/prescriptions/);
    await expect(page.getByText(/PENDING|قيد الانتظار/i).first()).toBeVisible();

    // 2. Admin assigns to a pharmacy. (Sketch — the assign button lives on
    //    the request detail page.)
    // 3. Owner moves the resulting prescription order through the pipeline.
    //    Both halves of this journey will be filled in once the seed exists.
  });
});
