"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * Generic list skeleton — used while a list query is loading. Mobile-first:
 * stacked rows with adequate height. On `md+` it stays the same shape (the
 * real list switches to a table at `md+`, but the skeleton stays card-like
 * to avoid layout shift surprises).
 */
export function ListSkeleton({ rows = 6, className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4"
        >
          <Skeleton className="size-10 rounded-md sm:size-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5",
        className,
      )}
    >
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

interface KpiSkeletonProps {
  count?: number;
  className?: string;
}

export function KpiSkeleton({ count = 4, className }: KpiSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-xl border border-border bg-card p-4"
        >
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
