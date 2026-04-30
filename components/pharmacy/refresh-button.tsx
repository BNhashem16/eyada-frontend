"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  /**
   * Action that fetches fresh data. Typically:
   *   `() => queryClient.invalidateQueries({ queryKey: pharmacyKeys.lists() })`
   *
   * The button awaits the returned promise (if any) so the spinner state
   * lasts as long as the refetch.
   */
  onRefresh: () => void | Promise<unknown>;
  className?: string;
  /** Optional override for the button label. */
  label?: string;
  size?: "sm" | "default";
  variant?: "outline" | "ghost" | "default";
}

/**
 * The replacement for any auto-polling. Lets the user re-fetch on demand.
 *
 * Touch target ≥ 44px (size default + 44 minimum on mobile).
 */
export function RefreshButton({
  onRefresh,
  className,
  label,
  size = "sm",
  variant = "outline",
}: RefreshButtonProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={busy}
      onClick={handle}
      className={cn("min-h-[44px] gap-2 sm:min-h-9", className)}
    >
      <RefreshCw
        className={cn("h-4 w-4", busy && "animate-spin")}
        aria-hidden="true"
      />
      <span>{label ?? t("common.refresh")}</span>
    </Button>
  );
}
