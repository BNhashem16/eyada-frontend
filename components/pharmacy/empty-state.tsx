"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PharmacyEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PharmacyEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: PharmacyEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center sm:gap-4 sm:py-12",
        className,
      )}
    >
      {Icon ? (
        <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground sm:size-14">
          <Icon className="size-5 sm:size-6" aria-hidden="true" />
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </p>
        {description ? (
          <p className="mx-auto max-w-prose text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
