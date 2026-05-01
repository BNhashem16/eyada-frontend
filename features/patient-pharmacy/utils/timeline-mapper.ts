import type {
  PrescriptionRequest,
  PrescriptionOrder,
  PrescriptionOrderStatusHistory,
  ActorRole,
} from "@/types/prescription";
import type {
  TimelineModel,
  TimelineStep,
  TimelineStepState,
  TimelineTerminal,
} from "@/types/timeline";

/**
 * Patient-facing canonical journey. Internal backend statuses
 * collapse into these six steps. Mutating this array changes the
 * patient timeline contract — keep in sync with i18n keys under
 * `prescription.timeline.*`.
 */
const PATIENT_STEPS = [
  "submitted",
  "reviewed",
  "assigned",
  "preparing",
  "outForDelivery",
  "delivered",
] as const;

type PatientStepKey = (typeof PATIENT_STEPS)[number];

const STEP_LABEL: Record<PatientStepKey, string> = {
  submitted: "prescription.timeline.submitted",
  reviewed: "prescription.timeline.reviewed",
  assigned: "prescription.timeline.assigned",
  preparing: "prescription.timeline.preparing",
  outForDelivery: "prescription.timeline.outForDelivery",
  delivered: "prescription.timeline.delivered",
};

const ACTOR_LABEL: Record<ActorRole, string> = {
  PATIENT: "timeline.actor.patient",
  ADMIN: "timeline.actor.admin",
  PHARMACY_OWNER: "timeline.actor.pharmacy",
  DRIVER: "timeline.actor.driver",
  SYSTEM: "timeline.actor.system",
};

interface InternalReached {
  at?: string;
  actor?: ActorRole;
}

const parseTime = (iso?: string | null): number | null =>
  iso ? new Date(iso).getTime() : null;

/**
 * Earliest non-null timestamp wins. Used to pick the "first" time a
 * status was reached across multiple orders.
 */
const earliest = (
  ...candidates: Array<string | null | undefined>
): string | undefined => {
  let best: { iso: string; ms: number } | null = null;
  for (const candidate of candidates) {
    const ms = parseTime(candidate);
    if (ms === null) continue;
    if (best === null || ms < best.ms) {
      best = { iso: candidate as string, ms };
    }
  }
  return best?.iso;
};

const latest = (
  ...candidates: Array<string | null | undefined>
): string | undefined => {
  let best: { iso: string; ms: number } | null = null;
  for (const candidate of candidates) {
    const ms = parseTime(candidate);
    if (ms === null) continue;
    if (best === null || ms > best.ms) {
      best = { iso: candidate as string, ms };
    }
  }
  return best?.iso;
};

const findFirstHistory = (
  history: PrescriptionOrderStatusHistory[] | undefined,
  status: string,
): PrescriptionOrderStatusHistory | undefined =>
  history?.find((entry) => entry.toStatus === status);

interface OrderReachedMap {
  CONFIRMED?: InternalReached;
  PREPARING?: InternalReached;
  READY_FOR_PICKUP?: InternalReached;
  OUT_FOR_DELIVERY?: InternalReached;
  DELIVERED?: InternalReached;
  CANCELLED?: InternalReached;
}

const buildReachedForOrder = (order: PrescriptionOrder): OrderReachedMap => {
  const reached: OrderReachedMap = {};
  for (const entry of order.statusHistory ?? []) {
    const at = entry.createdAt;
    const actor = entry.changedByRole;
    switch (entry.toStatus) {
      case "CONFIRMED":
      case "PREPARING":
      case "READY_FOR_PICKUP":
      case "OUT_FOR_DELIVERY":
      case "DELIVERED":
      case "CANCELLED":
        reached[entry.toStatus] = { at, actor };
        break;
      default:
        // PENDING / RETURNED / REFUNDED are not part of the patient
        // timeline — collapsed elsewhere or cart-pipeline-only.
        break;
    }
  }

  // Fall back to per-status timestamp columns if history is empty.
  reached.CONFIRMED ??= order.confirmedAt
    ? { at: order.confirmedAt, actor: "ADMIN" }
    : undefined;
  reached.PREPARING ??= order.preparingAt
    ? { at: order.preparingAt, actor: "PHARMACY_OWNER" }
    : undefined;
  reached.READY_FOR_PICKUP ??= order.readyAt
    ? { at: order.readyAt, actor: "PHARMACY_OWNER" }
    : undefined;
  reached.DELIVERED ??= order.deliveredAt
    ? { at: order.deliveredAt, actor: "DRIVER" }
    : undefined;
  return reached;
};

interface AggregateReached {
  preparing?: InternalReached;
  outForDelivery?: InternalReached;
  delivered?: InternalReached;
  anyCancelled: boolean;
  allDelivered: boolean;
  hasOrders: boolean;
}

/**
 * Aggregates per-order reached states into request-level reached states
 * using min for "first reached" and max for "all reached." Patient is
 * only "delivered" once every order is delivered.
 */
const aggregateReached = (orders: PrescriptionOrder[]): AggregateReached => {
  if (orders.length === 0) {
    return { anyCancelled: false, allDelivered: false, hasOrders: false };
  }

  const perOrder = orders.map(buildReachedForOrder);

  const firstAt = (key: keyof OrderReachedMap): InternalReached | undefined => {
    const candidates = perOrder
      .map((m) => m[key])
      .filter((v): v is InternalReached => v !== undefined);
    if (candidates.length === 0) return undefined;
    const at = earliest(...candidates.map((c) => c.at));
    return { at, actor: candidates.find((c) => c.at === at)?.actor };
  };

  const lastAt = (key: keyof OrderReachedMap): InternalReached | undefined => {
    const candidates = perOrder
      .map((m) => m[key])
      .filter((v): v is InternalReached => v !== undefined);
    if (candidates.length === 0) return undefined;
    const at = latest(...candidates.map((c) => c.at));
    return { at, actor: candidates.find((c) => c.at === at)?.actor };
  };

  return {
    preparing: firstAt("PREPARING"),
    outForDelivery: firstAt("OUT_FOR_DELIVERY"),
    delivered: orders.every((o) => o.status === "DELIVERED")
      ? lastAt("DELIVERED")
      : undefined,
    anyCancelled: orders.every((o) => o.status === "CANCELLED"),
    allDelivered: orders.every((o) => o.status === "DELIVERED"),
    hasOrders: true,
  };
};

const stepState = (
  reached: boolean,
  isCurrent: boolean,
): TimelineStepState => {
  if (reached) return "done";
  if (isCurrent) return "current";
  return "pending";
};

/**
 * Pure mapper from a PrescriptionRequest (with eagerly-loaded orders +
 * statusHistory) to the patient-facing 6-step timeline. No React, no
 * I/O, no Date.now().
 */
export function mapPrescriptionToTimeline(
  request: PrescriptionRequest,
): TimelineModel {
  const orders = request.orders ?? [];
  const aggregate = aggregateReached(orders);

  // Cancelled at request level wins as terminal.
  if (request.status === "CANCELLED") {
    const partial = buildPartialStepsBeforeCancellation(request, aggregate);
    const terminal: TimelineTerminal = {
      kind: "cancelled",
      labelKey: "prescription.timeline.cancelled",
      at: request.cancelledAt ?? undefined,
      note: request.cancelReason ?? undefined,
    };
    return { steps: partial, terminal };
  }

  const submittedAt = request.createdAt;
  const reviewedAt = aggregate.hasOrders
    ? earliest(...orders.map((o) => o.createdAt))
    : undefined;
  const assignedAt = request.assignedAt ?? undefined;
  const preparingAt = aggregate.preparing?.at;
  const outForDeliveryAt = aggregate.outForDelivery?.at;
  const deliveredAt = aggregate.delivered?.at;

  const reached: Record<PatientStepKey, InternalReached | undefined> = {
    submitted: { at: submittedAt, actor: "PATIENT" },
    reviewed: reviewedAt ? { at: reviewedAt, actor: "ADMIN" } : undefined,
    assigned: assignedAt ? { at: assignedAt, actor: "ADMIN" } : undefined,
    preparing: aggregate.preparing,
    outForDelivery: aggregate.outForDelivery,
    delivered: aggregate.delivered,
  };

  // Find the first non-reached step — it is the current step.
  const firstPendingIndex = PATIENT_STEPS.findIndex(
    (key) => reached[key] === undefined,
  );

  const steps: TimelineStep[] = PATIENT_STEPS.map((key, index) => {
    const r = reached[key];
    const isReached = r !== undefined;
    const isCurrent =
      !isReached &&
      firstPendingIndex !== -1 &&
      index === firstPendingIndex &&
      // Avoid marking "current" when nothing happened yet beyond submission
      // (we always want the first step to be reached because submission is
      // the act that creates the request).
      true;

    const actorRole = r?.actor;
    return {
      key,
      labelKey: STEP_LABEL[key],
      state: stepState(isReached, isCurrent),
      at: r?.at,
      actorLabelKey: actorRole ? ACTOR_LABEL[actorRole] : undefined,
      actorRole,
    };
  });

  // Compile-time exhaustiveness guard.
  // If a new PatientStepKey is added, this assignment fails.
  const _exhaustive: Record<PatientStepKey, true> = {
    submitted: true,
    reviewed: true,
    assigned: true,
    preparing: true,
    outForDelivery: true,
    delivered: true,
  };
  void _exhaustive;

  // Force "delivered" final state when all orders are delivered (handles the
  // edge where statusHistory is missing but order.deliveredAt is set).
  if (aggregate.allDelivered && deliveredAt) {
    const last = steps[steps.length - 1];
    last.state = "done";
    last.at = deliveredAt;
  }

  return { steps };
}

/**
 * When the request is cancelled, render whatever steps were reached
 * before cancellation as `done`, leave the rest as `skipped`, then
 * append the terminal cancelled marker.
 */
function buildPartialStepsBeforeCancellation(
  request: PrescriptionRequest,
  aggregate: AggregateReached,
): TimelineStep[] {
  const reached: Record<PatientStepKey, InternalReached | undefined> = {
    submitted: { at: request.createdAt, actor: "PATIENT" },
    reviewed:
      request.assignedAt || aggregate.hasOrders
        ? {
            at:
              earliest(
                ...(request.orders ?? []).map((o) => o.createdAt),
              ) ?? undefined,
            actor: "ADMIN",
          }
        : undefined,
    assigned: request.assignedAt
      ? { at: request.assignedAt, actor: "ADMIN" }
      : undefined,
    preparing: aggregate.preparing,
    outForDelivery: aggregate.outForDelivery,
    delivered: undefined,
  };

  return PATIENT_STEPS.map((key) => {
    const r = reached[key];
    const isReached = r !== undefined;
    return {
      key,
      labelKey: STEP_LABEL[key],
      state: isReached ? ("done" as const) : ("skipped" as const),
      at: r?.at,
      actorLabelKey: r?.actor ? ACTOR_LABEL[r.actor] : undefined,
      actorRole: r?.actor,
    };
  });
}
