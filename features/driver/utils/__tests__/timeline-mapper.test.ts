import { describe, it, expect } from "vitest";
import { mapDeliveryToTimeline } from "../timeline-mapper";
import { OrderStatus } from "@/types/enums";
import type { DriverDelivery } from "@/types/driver";

const T0 = "2026-04-01T10:00:00.000Z";
const T1 = "2026-04-01T11:00:00.000Z";
const T2 = "2026-04-01T12:00:00.000Z";
const T3 = "2026-04-01T13:00:00.000Z";

function buildDelivery(partial: Partial<DriverDelivery> = {}): DriverDelivery {
  return {
    id: "d-1",
    orderNumber: "ORD-1",
    status: OrderStatus.READY_FOR_PICKUP,
    totalAmount: "100",
    deliveryFee: "10",
    deliveryType: "DELIVERY",
    items: [],
    confirmedAt: T0,
    readyAt: T1,
    ...partial,
  };
}

describe("mapDeliveryToTimeline", () => {
  it("emits 3 steps in canonical order", () => {
    const model = mapDeliveryToTimeline(buildDelivery());
    expect(model.steps.map((s) => s.key)).toEqual([
      "assigned",
      "pickedUp",
      "delivered",
    ]);
  });

  it("marks assigned as done when ready/confirmed timestamp exists", () => {
    const model = mapDeliveryToTimeline(buildDelivery());
    expect(model.steps[0].state).toBe("done");
    expect(model.steps[0].at).toBe(T0);
  });

  it("marks pickedUp current when ready but not yet picked up", () => {
    const model = mapDeliveryToTimeline(buildDelivery());
    expect(model.steps[1].state).toBe("current");
    expect(model.steps[2].state).toBe("pending");
  });

  it("marks pickedUp done with timestamp once delivery has pickedUpAt", () => {
    const model = mapDeliveryToTimeline(
      buildDelivery({
        status: OrderStatus.OUT_FOR_DELIVERY,
        delivery: { id: "del-1", pickedUpAt: T2 },
      }),
    );
    expect(model.steps[1].state).toBe("done");
    expect(model.steps[1].at).toBe(T2);
    expect(model.steps[2].state).toBe("current");
  });

  it("marks delivered done with timestamp once delivery has deliveredAt", () => {
    const model = mapDeliveryToTimeline(
      buildDelivery({
        status: OrderStatus.DELIVERED,
        delivery: { id: "del-1", pickedUpAt: T2, deliveredAt: T3 },
      }),
    );
    expect(model.steps[2].state).toBe("done");
    expect(model.steps[2].at).toBe(T3);
  });

  it("emits cancelled terminal when status is CANCELLED", () => {
    const model = mapDeliveryToTimeline(
      buildDelivery({ status: OrderStatus.CANCELLED }),
    );
    expect(model.terminal?.kind).toBe("cancelled");
    expect(model.terminal?.labelKey).toBe("driver.cancelled");
  });

  it("emits cancelled terminal when status is RETURNED", () => {
    const model = mapDeliveryToTimeline(
      buildDelivery({ status: OrderStatus.RETURNED }),
    );
    expect(model.terminal?.kind).toBe("cancelled");
  });

  it("renders pre-cancellation steps as done/skipped only", () => {
    const model = mapDeliveryToTimeline(
      buildDelivery({
        status: OrderStatus.CANCELLED,
        delivery: { id: "del-1", pickedUpAt: T2 },
      }),
    );
    for (const step of model.steps) {
      expect(["done", "skipped"]).toContain(step.state);
    }
    expect(model.steps[0].state).toBe("done");
    expect(model.steps[1].state).toBe("done");
    expect(model.steps[2].state).toBe("skipped");
  });

  it("uses i18n keys at the existing flat driver namespace", () => {
    const model = mapDeliveryToTimeline(buildDelivery());
    expect(model.steps[0].labelKey).toBe("driver.assigned");
    expect(model.steps[1].labelKey).toBe("driver.pickedUp");
    expect(model.steps[2].labelKey).toBe("driver.delivered");
  });
});
