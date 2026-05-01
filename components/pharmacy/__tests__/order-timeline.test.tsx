import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("@/lib/i18n", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "en" as const,
    isRtl: false,
    dir: "ltr" as const,
  }),
}));

import { OrderTimeline } from "../order-timeline";
import type { TimelineModel } from "@/types/timeline";

const T0 = "2026-04-01T10:00:00.000Z";
const T1 = "2026-04-01T11:00:00.000Z";

const baseModel: TimelineModel = {
  steps: [
    {
      key: "submitted",
      labelKey: "prescription.timeline.submitted",
      state: "done",
      at: T0,
      actorLabelKey: "timeline.actor.patient",
    },
    {
      key: "reviewed",
      labelKey: "prescription.timeline.reviewed",
      state: "current",
    },
    {
      key: "delivered",
      labelKey: "prescription.timeline.delivered",
      state: "pending",
    },
  ],
};

describe("<OrderTimeline />", () => {
  it("renders an ordered list with the timeline label", () => {
    render(<OrderTimeline {...baseModel} />);
    const list = screen.getByRole("list", { name: "timeline.label" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("marks the current step with aria-current=step and only that step", () => {
    render(<OrderTimeline {...baseModel} />);
    const items = screen.getAllByRole("listitem");
    const currents = items.filter(
      (li) => li.getAttribute("aria-current") === "step",
    );
    expect(currents).toHaveLength(1);
    expect(currents[0]).toHaveTextContent("prescription.timeline.reviewed");
  });

  it("renders a <time> element with dateTime for steps that have a timestamp", () => {
    const { container } = render(<OrderTimeline {...baseModel} />);
    const timeEls = container.querySelectorAll("time");
    expect(timeEls.length).toBeGreaterThanOrEqual(1);
    const submittedTime = Array.from(timeEls).find(
      (el) => el.getAttribute("datetime") === T0,
    );
    expect(submittedTime).toBeDefined();
  });

  it("includes sr-only state announcement for each step", () => {
    render(<OrderTimeline {...baseModel} />);
    const submitted = screen.getByText(
      "prescription.timeline.submitted",
      { exact: false },
    );
    expect(submitted.textContent).toContain("timeline.state.done");
  });

  it("renders the cancelled terminal row with role=status", () => {
    render(
      <OrderTimeline
        steps={[
          {
            key: "submitted",
            labelKey: "prescription.timeline.submitted",
            state: "done",
            at: T0,
          },
        ]}
        terminal={{
          kind: "cancelled",
          labelKey: "prescription.timeline.cancelled",
          at: T1,
          note: "Out of stock",
        }}
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("prescription.timeline.cancelled");
    expect(status).toHaveTextContent("Out of stock");
  });

  it("renders nothing when steps and terminal are both empty", () => {
    const { container } = render(<OrderTimeline steps={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("attaches the actor label when a step has actorLabelKey", () => {
    render(<OrderTimeline {...baseModel} />);
    expect(screen.getByText("timeline.actor.patient")).toBeInTheDocument();
  });
});
