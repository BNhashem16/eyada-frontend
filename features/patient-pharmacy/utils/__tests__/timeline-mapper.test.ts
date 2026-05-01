import { describe, it, expect } from "vitest";
import { mapPrescriptionToTimeline } from "../timeline-mapper";
import {
  PrescriptionRequestStatus,
  PrescriptionType,
  type PrescriptionRequest,
  type PrescriptionOrder,
  type PrescriptionOrderStatusHistory,
} from "@/types/prescription";

const T0 = "2026-04-01T10:00:00.000Z";
const T1 = "2026-04-01T10:30:00.000Z";
const T2 = "2026-04-01T11:00:00.000Z";
const T3 = "2026-04-01T12:00:00.000Z";
const T4 = "2026-04-01T13:00:00.000Z";
const T5 = "2026-04-01T14:00:00.000Z";

function buildHistory(
  partial: Partial<PrescriptionOrderStatusHistory>,
): PrescriptionOrderStatusHistory {
  return {
    id: "h-" + (partial.toStatus ?? "x"),
    fromStatus: null,
    toStatus: "PENDING",
    changedBy: "u-1",
    changedByRole: "SYSTEM",
    note: null,
    createdAt: T0,
    ...partial,
  };
}

function buildOrder(partial: Partial<PrescriptionOrder> = {}): PrescriptionOrder {
  return {
    id: "o-1",
    orderNumber: "ORD-1",
    status: "PENDING",
    subtotal: 100,
    deliveryFee: 10,
    totalAmount: 110,
    paymentStatus: "PENDING",
    items: [],
    statusHistory: [],
    createdAt: T1,
    confirmedAt: null,
    preparingAt: null,
    readyAt: null,
    deliveredAt: null,
    cancelledAt: null,
    ...partial,
  };
}

function buildRequest(
  partial: Partial<PrescriptionRequest> = {},
): PrescriptionRequest {
  return {
    id: "r-1",
    requestNumber: "REQ-1",
    type: PrescriptionType.IMAGE,
    prescriptionImages: ["img.jpg"],
    prescriptionText: null,
    notes: null,
    status: PrescriptionRequestStatus.PENDING_REVIEW,
    assignedBy: null,
    assignedAt: null,
    totalAmount: null,
    cancelReason: null,
    cancelledAt: null,
    orders: [],
    createdAt: T0,
    updatedAt: T0,
    ...partial,
  };
}

describe("mapPrescriptionToTimeline", () => {
  it("emits 6 steps in canonical order", () => {
    const model = mapPrescriptionToTimeline(buildRequest());
    expect(model.steps.map((s) => s.key)).toEqual([
      "submitted",
      "reviewed",
      "assigned",
      "preparing",
      "outForDelivery",
      "delivered",
    ]);
  });

  it("marks submitted as done from createdAt with PATIENT actor", () => {
    const model = mapPrescriptionToTimeline(buildRequest());
    const submitted = model.steps[0];
    expect(submitted.state).toBe("done");
    expect(submitted.at).toBe(T0);
    expect(submitted.actorRole).toBe("PATIENT");
  });

  it("marks the first non-reached step as current", () => {
    // Pending review: only submitted is reached
    const model = mapPrescriptionToTimeline(buildRequest());
    expect(model.steps[0].state).toBe("done");
    expect(model.steps[1].state).toBe("current");
    expect(model.steps[2].state).toBe("pending");
  });

  it("collapses statusHistory across multiple orders by earliest reached", () => {
    const orderA = buildOrder({
      id: "a",
      statusHistory: [
        buildHistory({
          toStatus: "PREPARING",
          createdAt: T3,
          changedByRole: "PHARMACY_OWNER",
        }),
      ],
      preparingAt: T3,
    });
    const orderB = buildOrder({
      id: "b",
      statusHistory: [
        buildHistory({
          toStatus: "PREPARING",
          createdAt: T2,
          changedByRole: "PHARMACY_OWNER",
        }),
      ],
      preparingAt: T2,
    });
    const model = mapPrescriptionToTimeline(
      buildRequest({
        status: PrescriptionRequestStatus.PREPARING,
        assignedAt: T1,
        orders: [orderA, orderB],
      }),
    );
    const preparing = model.steps.find((s) => s.key === "preparing");
    expect(preparing?.state).toBe("done");
    expect(preparing?.at).toBe(T2);
  });

  it("only marks delivered when ALL orders are delivered", () => {
    const oneDelivered = buildOrder({
      id: "a",
      status: "DELIVERED",
      deliveredAt: T4,
    });
    const oneOut = buildOrder({
      id: "b",
      status: "OUT_FOR_DELIVERY",
    });
    const partial = mapPrescriptionToTimeline(
      buildRequest({
        status: PrescriptionRequestStatus.OUT_FOR_DELIVERY,
        assignedAt: T1,
        orders: [oneDelivered, oneOut],
      }),
    );
    expect(
      partial.steps.find((s) => s.key === "delivered")?.state,
    ).not.toBe("done");

    const allDelivered = mapPrescriptionToTimeline(
      buildRequest({
        status: PrescriptionRequestStatus.DELIVERED,
        assignedAt: T1,
        orders: [
          buildOrder({ id: "a", status: "DELIVERED", deliveredAt: T4 }),
          buildOrder({ id: "b", status: "DELIVERED", deliveredAt: T5 }),
        ],
      }),
    );
    const delivered = allDelivered.steps.find((s) => s.key === "delivered");
    expect(delivered?.state).toBe("done");
    expect(delivered?.at).toBe(T5);
  });

  it("falls back to per-status timestamp columns when statusHistory is empty", () => {
    const order = buildOrder({
      statusHistory: [],
      confirmedAt: T2,
      preparingAt: T3,
    });
    const model = mapPrescriptionToTimeline(
      buildRequest({
        status: PrescriptionRequestStatus.PREPARING,
        assignedAt: T1,
        orders: [order],
      }),
    );
    const preparing = model.steps.find((s) => s.key === "preparing");
    expect(preparing?.state).toBe("done");
    expect(preparing?.at).toBe(T3);
  });

  it("emits a cancelled terminal when request status is CANCELLED", () => {
    const model = mapPrescriptionToTimeline(
      buildRequest({
        status: PrescriptionRequestStatus.CANCELLED,
        cancelledAt: T2,
        cancelReason: "Out of stock",
      }),
    );
    expect(model.terminal).toBeDefined();
    expect(model.terminal?.kind).toBe("cancelled");
    expect(model.terminal?.at).toBe(T2);
    expect(model.terminal?.note).toBe("Out of stock");
  });

  it("renders pre-cancellation steps as done/skipped (no current/pending)", () => {
    const model = mapPrescriptionToTimeline(
      buildRequest({
        status: PrescriptionRequestStatus.CANCELLED,
        assignedAt: T1,
        cancelledAt: T2,
      }),
    );
    for (const step of model.steps) {
      expect(["done", "skipped"]).toContain(step.state);
    }
  });

  it("attaches actor labels to reached steps", () => {
    const model = mapPrescriptionToTimeline(
      buildRequest({
        assignedAt: T1,
        status: PrescriptionRequestStatus.ASSIGNED,
      }),
    );
    const submitted = model.steps[0];
    const assigned = model.steps[2];
    expect(submitted.actorLabelKey).toBe("timeline.actor.patient");
    expect(assigned.actorLabelKey).toBe("timeline.actor.admin");
  });
});
