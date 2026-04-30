import { describe, it, expect } from "vitest";
import { getTranslation } from "@/lib/i18n";
import { createPharmacySchema } from "../pharmacy-schema";
import { DeliveryType } from "@/types/enums";

const validPayload = {
  name: "صيدلية الحياة",
  description: "وصف",
  address: "15 شارع مصطفى النحاس",
  stateId: "state-1",
  cityId: "city-1",
  latitude: 30.04,
  longitude: 31.23,
  phoneNumbers: [{ value: "01012345678" }],
  deliveryType: DeliveryType.SELF_DELIVERY,
  deliveryFee: 10,
  minOrderAmount: 50,
  freeDeliveryThreshold: 200,
  isActive: true,
};

function tFor(locale: "ar" | "en") {
  return (key: string) => getTranslation(key, locale);
}

describe("createPharmacySchema", () => {
  it("accepts a valid payload (ar locale)", () => {
    const schema = createPharmacySchema(tFor("ar"));
    expect(schema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts a valid payload (en locale)", () => {
    const schema = createPharmacySchema(tFor("en"));
    expect(schema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects empty name with the localized arabic message", () => {
    const schema = createPharmacySchema(tFor("ar"));
    const result = schema.safeParse({ ...validPayload, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues[0]?.message;
      expect(message).toBe(getTranslation("validation.required", "ar"));
    }
  });

  it("rejects empty name with the localized english message", () => {
    const schema = createPharmacySchema(tFor("en"));
    const result = schema.safeParse({ ...validPayload, name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues[0]?.message;
      expect(message).toBe(getTranslation("validation.required", "en"));
      expect(message).toMatch(/required/i);
    }
  });

  it("rejects an invalid Egyptian phone number", () => {
    const schema = createPharmacySchema(tFor("en"));
    const result = schema.safeParse({
      ...validPayload,
      phoneNumbers: [{ value: "12345" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty phone string (will be filtered by buildPharmacyPayload)", () => {
    const schema = createPharmacySchema(tFor("en"));
    const result = schema.safeParse({
      ...validPayload,
      phoneNumbers: [{ value: "" }],
    });
    expect(result.success).toBe(true);
  });

  it("coerces latitude/longitude from string to number", () => {
    const schema = createPharmacySchema(tFor("en"));
    const result = schema.safeParse({
      ...validPayload,
      latitude: "30.04",
      longitude: "31.23",
    } as unknown as typeof validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.latitude).toBe("number");
      expect(result.data.latitude).toBe(30.04);
    }
  });

  it("rejects latitude outside [-90, 90]", () => {
    const schema = createPharmacySchema(tFor("en"));
    expect(schema.safeParse({ ...validPayload, latitude: 91 }).success).toBe(
      false,
    );
  });
});
