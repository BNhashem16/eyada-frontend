import type { DriverDelivery } from "@/types/driver";
import type { TimelineModel, TimelineStep } from "@/types/timeline";

/**
 * Driver-facing canonical journey: 3 visible states.
 * Mutating this list changes the driver page contract.
 */
const DRIVER_STEPS = ["assigned", "pickedUp", "delivered"] as const;

type DriverStepKey = (typeof DRIVER_STEPS)[number];

const STEP_LABEL: Record<DriverStepKey, string> = {
  assigned: "driver.timeline.assigned",
  pickedUp: "driver.timeline.pickedUp",
  delivered: "driver.timeline.delivered",
};

/**
 * Pure mapper from a driver-side delivery DTO to the 3-step timeline.
 * Inputs come straight from `useDriverDelivery`; we never read globals.
 */
export function mapDeliveryToTimeline(
  delivery: DriverDelivery,
): TimelineModel {
  const pickedUpAt = delivery.delivery?.pickedUpAt;
  const deliveredAt = delivery.delivery?.deliveredAt;
  const status = delivery.status;
  const isCancelled = status === "CANCELLED" || status === "RETURNED";

  // Assigned step is always reached the moment the driver sees this.
  const reached: Record<DriverStepKey, string | undefined> = {
    assigned: delivery.confirmedAt ?? delivery.readyAt,
    pickedUp: pickedUpAt,
    delivered: deliveredAt,
  };

  if (isCancelled) {
    const steps: TimelineStep[] = DRIVER_STEPS.map((key) => {
      const at = reached[key];
      return {
        key,
        labelKey: STEP_LABEL[key],
        state: at ? ("done" as const) : ("skipped" as const),
        at,
      };
    });
    return {
      steps,
      terminal: {
        kind: "cancelled",
        labelKey: "driver.timeline.cancelled",
      },
    };
  }

  const firstPendingIndex = DRIVER_STEPS.findIndex(
    (key) => reached[key] === undefined,
  );

  const steps: TimelineStep[] = DRIVER_STEPS.map((key, index) => {
    const at = reached[key];
    const isReached = at !== undefined;
    const isCurrent =
      !isReached && firstPendingIndex !== -1 && index === firstPendingIndex;

    return {
      key,
      labelKey: STEP_LABEL[key],
      state: isReached ? "done" : isCurrent ? "current" : "pending",
      at,
    };
  });

  // Compile-time exhaustiveness guard for DRIVER_STEPS.
  const _exhaustive: Record<DriverStepKey, true> = {
    assigned: true,
    pickedUp: true,
    delivered: true,
  };
  void _exhaustive;

  return { steps };
}
