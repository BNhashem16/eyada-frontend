"use client";

import {
  Check,
  Clock,
  Loader2,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type {
  TimelineModel,
  TimelineStep,
  TimelineStepState,
  TimelineTerminal,
} from "@/types/timeline";

type OrderTimelineVariant = "default" | "compact";

interface OrderTimelineProps extends TimelineModel {
  variant?: OrderTimelineVariant;
  className?: string;
}

const STATE_ICON: Record<TimelineStepState, LucideIcon> = {
  done: Check,
  current: Loader2,
  pending: Clock,
  skipped: Clock,
};

const STATE_LABEL_KEY: Record<TimelineStepState, string> = {
  done: "timeline.state.done",
  current: "timeline.state.current",
  pending: "timeline.state.pending",
  skipped: "timeline.state.skipped",
};

export function OrderTimeline({
  steps,
  terminal,
  variant = "default",
  className,
}: OrderTimelineProps) {
  const { t, locale } = useTranslation();

  if (steps.length === 0 && !terminal) {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <ol
      aria-label={t("timeline.label")}
      className={cn(
        "relative space-y-4 ps-1 motion-safe:transition-opacity",
        variant === "compact" && "space-y-3",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1 && !terminal;
        return (
          <Step
            key={step.key}
            step={step}
            isLast={isLast}
            t={t}
            formatDate={(iso) => dateFormatter.format(new Date(iso))}
          />
        );
      })}

      {terminal ? (
        <TerminalRow
          terminal={terminal}
          t={t}
          formatDate={(iso) => dateFormatter.format(new Date(iso))}
        />
      ) : null}
    </ol>
  );
}

function Step({
  step,
  isLast,
  t,
  formatDate,
}: {
  step: TimelineStep;
  isLast: boolean;
  t: (key: string) => string;
  formatDate: (iso: string) => string;
}) {
  const Icon = STATE_ICON[step.state];
  const stateLabel = t(STATE_LABEL_KEY[step.state]);
  const isCurrent = step.state === "current";
  const isDone = step.state === "done";

  return (
    <li
      className="relative flex gap-3"
      aria-current={isCurrent ? "step" : undefined}
    >
      <div className="flex shrink-0 flex-col items-center">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 place-items-center rounded-full border",
            isDone &&
              "border-success-300 bg-success-100 text-success-700 dark:border-success-700 dark:bg-success-900/40 dark:text-success-200",
            isCurrent &&
              "border-primary-300 bg-primary-100 text-primary-700 dark:border-primary-700 dark:bg-primary-900/40 dark:text-primary-200",
            !isDone &&
              !isCurrent &&
              "border-border bg-muted text-muted-foreground",
          )}
        >
          <Icon
            className={cn(
              "size-4",
              isCurrent && "motion-safe:animate-spin",
            )}
          />
        </span>
        {!isLast ? (
          <span
            aria-hidden="true"
            className={cn(
              "mt-1 w-0.5 flex-1 min-h-[1.5rem]",
              isDone
                ? "bg-success-300 dark:bg-success-700"
                : "bg-border",
            )}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1 pb-2">
        <p
          className={cn(
            "text-sm font-medium",
            !isDone && !isCurrent && "text-muted-foreground",
          )}
        >
          {t(step.labelKey)}
          <span className="sr-only"> — {stateLabel}</span>
        </p>
        {step.at ? (
          <time
            dateTime={step.at}
            className="block text-xs text-muted-foreground"
          >
            {formatDate(step.at)}
          </time>
        ) : null}
        {step.actorLabelKey ? (
          <p className="text-xs text-muted-foreground">
            {t(step.actorLabelKey)}
          </p>
        ) : null}
        {step.note ? (
          <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
            {step.note}
          </p>
        ) : null}
      </div>
    </li>
  );
}

function TerminalRow({
  terminal,
  t,
  formatDate,
}: {
  terminal: TimelineTerminal;
  t: (key: string) => string;
  formatDate: (iso: string) => string;
}) {
  const Icon = terminal.kind === "cancelled" ? XCircle : AlertCircle;
  const isCancelled = terminal.kind === "cancelled";

  return (
    <li className="relative flex gap-3" role="status">
      <div className="flex shrink-0 flex-col items-center">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 place-items-center rounded-full border",
            isCancelled
              ? "border-warning-300 bg-warning-100 text-warning-700 dark:border-warning-700 dark:bg-warning-900/40 dark:text-warning-200"
              : "border-error-300 bg-error-100 text-error-700 dark:border-error-700 dark:bg-error-900/40 dark:text-error-200",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <p
          className={cn(
            "text-sm font-medium",
            isCancelled
              ? "text-warning-700 dark:text-warning-200"
              : "text-error-700 dark:text-error-200",
          )}
        >
          {t(terminal.labelKey)}
        </p>
        {terminal.at ? (
          <time
            dateTime={terminal.at}
            className="block text-xs text-muted-foreground"
          >
            {formatDate(terminal.at)}
          </time>
        ) : null}
        {terminal.note ? (
          <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
            {terminal.note}
          </p>
        ) : null}
      </div>
    </li>
  );
}
