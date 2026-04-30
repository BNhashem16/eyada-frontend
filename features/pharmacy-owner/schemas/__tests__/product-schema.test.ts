import { describe, it, expect } from "vitest";
import { getTranslation } from "@/lib/i18n";
import { createProductSchema } from "../product-schema";

const validPayload = {
  nameAr: "باراسيتامول",
  nameEn: "Paracetamol",
  descriptionAr: "مسكن",
  descriptionEn: "Pain reliever",
  categoryId: "cat-1",
  sku: "SKU-001",
  barcode: "1234567890",
  price: 25.5,
  discountPrice: 20,
  stockQuantity: 100,
  lowStockThreshold: 10,
  requiresPrescription: false,
  isActive: true,
};

function tFor(locale: "ar" | "en") {
  return (key: string) => getTranslation(key, locale);
}

describe("createProductSchema", () => {
  it("accepts a valid payload in both locales", () => {
    expect(
      createProductSchema(tFor("ar")).safeParse(validPayload).success,
    ).toBe(true);
    expect(
      createProductSchema(tFor("en")).safeParse(validPayload).success,
    ).toBe(true);
  });

  it("requires bilingual names with min length 2", () => {
    const schema = createProductSchema(tFor("en"));
    expect(schema.safeParse({ ...validPayload, nameAr: "" }).success).toBe(
      false,
    );
    expect(schema.safeParse({ ...validPayload, nameEn: "a" }).success).toBe(
      false,
    );
  });

  it("rejects price <= 0", () => {
    const schema = createProductSchema(tFor("en"));
    expect(schema.safeParse({ ...validPayload, price: 0 }).success).toBe(false);
    expect(schema.safeParse({ ...validPayload, price: -1 }).success).toBe(
      false,
    );
  });

  it("accepts empty optional fields", () => {
    const schema = createProductSchema(tFor("en"));
    const result = schema.safeParse({
      ...validPayload,
      descriptionAr: "",
      descriptionEn: "",
      categoryId: "",
      sku: "",
      barcode: "",
      discountPrice: "",
      stockQuantity: "",
      lowStockThreshold: "",
    } as unknown as typeof validPayload);
    expect(result.success).toBe(true);
  });

  it("coerces stockQuantity from a numeric string to int", () => {
    const schema = createProductSchema(tFor("en"));
    const result = schema.safeParse({
      ...validPayload,
      stockQuantity: "100",
    } as unknown as typeof validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.stockQuantity).toBe("number");
      expect(result.data.stockQuantity).toBe(100);
    }
  });

  it("rejects price > 100k", () => {
    const schema = createProductSchema(tFor("en"));
    expect(schema.safeParse({ ...validPayload, price: 100_001 }).success).toBe(
      false,
    );
  });

  it("emits localized validation messages for missing name", () => {
    const schemaAr = createProductSchema(tFor("ar"));
    const resultAr = schemaAr.safeParse({ ...validPayload, nameAr: "" });
    expect(resultAr.success).toBe(false);
    if (!resultAr.success) {
      expect(resultAr.error.issues[0]?.message).toBe(
        getTranslation("validation.required", "ar"),
      );
    }

    const schemaEn = createProductSchema(tFor("en"));
    const resultEn = schemaEn.safeParse({ ...validPayload, nameAr: "" });
    expect(resultEn.success).toBe(false);
    if (!resultEn.success) {
      expect(resultEn.error.issues[0]?.message).toBe(
        getTranslation("validation.required", "en"),
      );
    }
  });
});
