import type { ActorRole } from "./prescription";

export type TimelineStepState = "done" | "current" | "pending" | "skipped";

export type TimelineTerminalKind = "cancelled" | "failed";

export interface TimelineStep {
  /** Stable identifier; reused as React key. */
  key: string;
  /** i18n key resolved by the component (never an inline string). */
  labelKey: string;
  state: TimelineStepState;
  /** ISO 8601 timestamp the step was reached. Omitted when not yet reached. */
  at?: string;
  /** Optional i18n key for the actor that performed this transition. */
  actorLabelKey?: string;
  /** Raw actor role, surfaced for telemetry / future fine-grained UI. */
  actorRole?: ActorRole;
  /** Free text (cancel reason, pharmacy note). Already sanitized server-side. */
  note?: string;
}

export interface TimelineTerminal {
  kind: TimelineTerminalKind;
  labelKey: string;
  at?: string;
  note?: string;
}

export interface TimelineModel {
  steps: TimelineStep[];
  terminal?: TimelineTerminal;
}
