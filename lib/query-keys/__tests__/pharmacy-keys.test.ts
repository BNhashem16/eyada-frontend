import { describe, it, expect } from "vitest";
import {
  pharmacyKeys,
  pharmacyOrderKeys,
  pharmacyProductKeys,
  pharmacyWalletKeys,
  pharmacyCampaignKeys,
  pharmacyDriverKeys,
  prescriptionKeys,
  patientCartKeys,
  patientPharmacyOrderKeys,
  patientPharmacyBrowseKeys,
} from "../pharmacy";

describe("pharmacyKeys", () => {
  it("derives lists/details/detail from .all so invalidating .all cascades", () => {
    expect(pharmacyKeys.all).toEqual(["pharmacy"]);
    expect(pharmacyKeys.lists()).toEqual(["pharmacy", "list"]);
    expect(pharmacyKeys.list({ page: 1 })).toEqual([
      "pharmacy",
      "list",
      { page: 1 },
    ]);
    expect(pharmacyKeys.details()).toEqual(["pharmacy", "detail"]);
    expect(pharmacyKeys.detail("p-1")).toEqual(["pharmacy", "detail", "p-1"]);
  });

  it("returns the same array shape for identical filters (TanStack key equality)", () => {
    const a = pharmacyKeys.list({ page: 1, limit: 20 });
    const b = pharmacyKeys.list({ page: 1, limit: 20 });
    expect(a).toEqual(b);
  });
});

describe("pharmacyOrderKeys", () => {
  it("scopes everything by pharmacyId", () => {
    expect(pharmacyOrderKeys.scoped("p-1")).toEqual(["pharmacy-orders", "p-1"]);
    expect(pharmacyOrderKeys.list("p-1", { status: "PENDING" })).toEqual([
      "pharmacy-orders",
      "p-1",
      "list",
      { status: "PENDING" },
    ]);
    expect(pharmacyOrderKeys.detail("p-1", "o-9")).toEqual([
      "pharmacy-orders",
      "p-1",
      "detail",
      "o-9",
    ]);
  });
});

describe("pharmacyWalletKeys", () => {
  it("separates balance / transactions / settlements per pharmacy", () => {
    expect(pharmacyWalletKeys.balance("p-1")).toEqual([
      "pharmacy-wallet",
      "p-1",
      "balance",
    ]);
    expect(pharmacyWalletKeys.transactions("p-1", { page: 1 })).toEqual([
      "pharmacy-wallet",
      "p-1",
      "transactions",
      { page: 1 },
    ]);
    expect(pharmacyWalletKeys.settlements("p-1", { page: 2 })).toEqual([
      "pharmacy-wallet",
      "p-1",
      "settlements",
      { page: 2 },
    ]);
  });
});

describe("pharmacyDriverKeys", () => {
  it("exposes an availableForOrder bucket", () => {
    expect(pharmacyDriverKeys.availableForOrder("p-1", "o-1")).toEqual([
      "pharmacy-drivers",
      "p-1",
      "available-for-order",
      "o-1",
    ]);
  });
});

describe("prescriptionKeys", () => {
  it("partitions by role to prevent cross-role cache collisions", () => {
    expect(prescriptionKeys.patientRequests({ page: 1 })[1]).toBe("patient");
    expect(prescriptionKeys.adminRequests({ page: 1 })[1]).toBe("admin");
    expect(prescriptionKeys.pharmacyOrders("p-1")[1]).toBe("pharmacy");
  });
});

describe("patient pharmacy keys", () => {
  it("are isolated namespaces", () => {
    expect(patientCartKeys.all).toEqual(["patient-cart"]);
    expect(patientPharmacyOrderKeys.all).toEqual(["patient-pharmacy-orders"]);
    expect(patientPharmacyBrowseKeys.all).toEqual(["patient-pharmacy-browse"]);
  });
});

describe("pharmacyProductKeys", () => {
  it("scoped() prefix is invalidated by both lists() and details()", () => {
    const scoped = pharmacyProductKeys.scoped("p-1");
    const lists = pharmacyProductKeys.lists("p-1");
    const details = pharmacyProductKeys.details("p-1");
    expect(lists.slice(0, scoped.length)).toEqual(scoped);
    expect(details.slice(0, scoped.length)).toEqual(scoped);
  });
});

describe("pharmacyCampaignKeys", () => {
  it("hierarchy follows the canonical pattern", () => {
    expect(pharmacyCampaignKeys.list("p-1", { status: "ACTIVE" })).toEqual([
      "pharmacy-campaigns",
      "p-1",
      "list",
      { status: "ACTIVE" },
    ]);
  });
});
