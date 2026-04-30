import { describe, it, expect } from "vitest";
import { getTranslation } from "@/lib/i18n";
import { createSettlementRequestSchema } from "../settlement-schema";

function tFor(locale: "ar" | "en") {
  return (key: string) => getTranslation(key, locale);
}

describe("createSettlementRequestSchema", () => {
  it("requires a positive amount", () => {
    const schema = createSettlementRequestSchema(tFor("en"));
    expect(schema.safeParse({ amount: 0 }).success).toBe(false);
    expect(schema.safeParse({ amount: 100 }).success).toBe(true);
    expect(schema.safeParse({ amount: -1 }).success).toBe(false);
  });

  it("notes are optional and capped at 500 chars", () => {
    const schema = createSettlementRequestSchema(tFor("en"));
    expect(schema.safeParse({ amount: 100 }).success).toBe(true);
    expect(schema.safeParse({ amount: 100, notes: "ok" }).success).toBe(true);
    expect(
      schema.safeParse({ amount: 100, notes: "x".repeat(501) }).success,
    ).toBe(false);
  });

  it("amount is capped at 1,000,000", () => {
    const schema = createSettlementRequestSchema(tFor("en"));
    expect(schema.safeParse({ amount: 1_000_001 }).success).toBe(false);
    expect(schema.safeParse({ amount: 1_000_000 }).success).toBe(true);
  });

  it("emits localized message for missing amount", () => {
    const schemaAr = createSettlementRequestSchema(tFor("ar"));
    const result = schemaAr.safeParse({ amount: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        getTranslation("validation.required", "ar"),
      );
    }
  });
});
