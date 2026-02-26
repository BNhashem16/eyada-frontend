import { describe, it, expect } from "vitest";
import {
  buildPharmacyPayload,
  type PharmacyFormValues,
} from "../build-pharmacy-payload";

const baseFormValues: PharmacyFormValues = {
  name: "صيدلية الحياة",
  description: "وصف مختصر للصيدلية",
  address: "15 شارع مصطفى النحاس، مدينة نصر",
  stateId: "state-1",
  cityId: "city-1",
  latitude: 30.0444,
  longitude: 31.2357,
  phoneNumbers: [{ value: "01012345678" }, { value: "01198765432" }],
  deliveryType: "SELF_DELIVERY" as any,
  deliveryFee: 10,
  minOrderAmount: 50,
  freeDeliveryThreshold: 200,
  isActive: true,
};

describe("buildPharmacyPayload", () => {
  it("sends name, description, and address as plain strings (not bilingual objects)", () => {
    const payload = buildPharmacyPayload(baseFormValues);

    expect(payload.name).toBe("صيدلية الحياة");
    expect(typeof payload.name).toBe("string");

    expect(payload.description).toBe("وصف مختصر للصيدلية");
    expect(typeof payload.description).toBe("string");

    expect(payload.address).toBe("15 شارع مصطفى النحاس، مدينة نصر");
    expect(typeof payload.address).toBe("string");
  });

  it("does NOT include stateId in the payload (backend only needs cityId)", () => {
    const payload = buildPharmacyPayload(baseFormValues);

    expect(payload).not.toHaveProperty("stateId");
    expect(payload.cityId).toBe("city-1");
  });

  it("filters out empty phone numbers", () => {
    const values: PharmacyFormValues = {
      ...baseFormValues,
      phoneNumbers: [
        { value: "01012345678" },
        { value: "" },
        { value: "01198765432" },
      ],
    };
    const payload = buildPharmacyPayload(values);

    expect(payload.phoneNumbers).toEqual(["01012345678", "01198765432"]);
  });

  it("sets description to undefined when empty", () => {
    const values: PharmacyFormValues = {
      ...baseFormValues,
      description: "",
    };
    const payload = buildPharmacyPayload(values);

    expect(payload.description).toBeUndefined();
  });

  it("converts numeric fields from form values to numbers", () => {
    const payload = buildPharmacyPayload(baseFormValues);

    expect(payload.latitude).toBe(30.0444);
    expect(payload.longitude).toBe(31.2357);
    expect(payload.deliveryFee).toBe(10);
    expect(payload.minOrderAmount).toBe(50);
    expect(payload.freeDeliveryThreshold).toBe(200);
  });

  it("sets optional numeric fields to undefined when empty string", () => {
    const values: PharmacyFormValues = {
      ...baseFormValues,
      latitude: "",
      longitude: "",
      deliveryFee: "",
      minOrderAmount: "",
      freeDeliveryThreshold: "",
    };
    const payload = buildPharmacyPayload(values);

    expect(payload.latitude).toBeUndefined();
    expect(payload.longitude).toBeUndefined();
    expect(payload.deliveryFee).toBeUndefined();
    expect(payload.minOrderAmount).toBeUndefined();
    expect(payload.freeDeliveryThreshold).toBeUndefined();
  });

  it("passes through deliveryType and isActive as-is", () => {
    const payload = buildPharmacyPayload(baseFormValues);

    expect(payload.deliveryType).toBe("SELF_DELIVERY");
    expect(payload.isActive).toBe(true);
  });
});
