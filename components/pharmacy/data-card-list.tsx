"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataCardListProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  renderCard: (item: T, index: number) => ReactNode;
  className?: string;
}

/**
 * Mobile-first card list that replaces a desktop table at `< md`.
 *
 * Pair with a desktop `<table>` rendered inside an `md:` block so the same
 * data has two responsive presentations:
 *
 *   <DataCardList … className="md:hidden" … />
 *   <table className="hidden md:table"> … </table>
 */
export function DataCardList<T>({
  items,
  getKey,
  renderCard,
  className,
}: DataCardListProps<T>) {
  return (
    <ul className={cn("space-y-3", className)} role="list">
      {items.map((item, index) => (
        <li
          key={getKey(item, index)}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          {renderCard(item, index)}
        </li>
      ))}
    </ul>
  );
}
